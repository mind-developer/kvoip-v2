/* @kvoip-woulz proprietary */
import { Injectable, Logger, Scope } from '@nestjs/common';
import axios from 'axios';
import { Job, Queue } from 'bullmq';
import Redis from 'ioredis';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ChatProviderDriver } from 'src/engine/core-modules/chat-message-manager/drivers/interfaces/chat-provider-driver-interface';
import { WhatsAppDriver } from 'src/engine/core-modules/chat-message-manager/drivers/whatsapp.driver';
import { ChatMessageManagerSetAbandonedCronJobData } from 'src/engine/core-modules/chat-message-manager/types/ChatMessageManagerSetAbandonedCronJobData';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessage,
  ClientChatMessageEvent,
  ClientChatStatus,
} from 'twenty-shared/types';
import { UpdateResult } from 'typeorm';
import { v4 } from 'uuid';

@Injectable({ scope: Scope.DEFAULT })
export class ChatMessageManagerService {
  private readonly logger = new Logger(ChatMessageManagerService.name);
  private activeCronJobs: string[];
  private readonly JOB_NAME = 'ChatMessageManagerSetAbandonedCronJob';
  private readonly redisClientInstance: Redis;
  private readonly queue: Queue;

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
    private readonly clientChatMessageService: ClientChatMessageService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly redisClient: RedisClientService,
  ) {
    this.activeCronJobs = [];
    this.redisClientInstance = this.redisClient.getClient();
    this.queue = new Queue(MessageQueue.cronQueue, {
      connection: this.redisClientInstance,
    });
  }

  @OnDatabaseBatchEvent('clientChat', DatabaseEventAction.UPDATED)
  async onClientChatUpdate(
    event: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ClientChatWorkspaceEntity>
    >,
  ) {
    const clientChat = event.events[0].properties.after;
    const person = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        event.workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      )
    ).findOneBy({ id: clientChat.personId });
    if (!person) {
      this.logger.error(
        'avemesserson not found for client chat:',
        clientChat.id,
      );
      return;
    }
    clientChat.person = person;
    this.clientChatMessageService.publishChatUpdated(
      clientChat,
      clientChat.sectorId!,
    );
  }
  @OnDatabaseBatchEvent('clientChat', DatabaseEventAction.CREATED)
  async onClientChatCreated(
    event: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ClientChatWorkspaceEntity>
    >,
  ) {
    const clientChat = event.events[0].properties.after;
    const person = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        event.workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      )
    ).findOneBy({ id: clientChat.personId });
    if (!person) {
      this.logger.error('Person not found for client chat:', clientChat.id);
      return;
    }
    clientChat.person = person;
    this.clientChatMessageService.publishChatCreated(
      clientChat,
      clientChat.sectorId,
    );
  }

  async sendMessage(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
    providerIntegrationId: string,
  ): Promise<string | null> {
    if (clientChatMessage.event) {
      await this.handleEventMessage(clientChatMessage, workspaceId);
      return v4();
    }
    const providerDriver = this.getProviderDriver(clientChatMessage.provider);
    const clientChatRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
        workspaceId,
        'clientChat',
        { shouldBypassPermissionChecks: true },
      );
    const clientChat = await clientChatRepository.findOne({
      where: { id: clientChatMessage.clientChatId },
    });
    if (!clientChat) {
      this.logger.error('Client chat not found');
      return null;
    }
    const providerMessageId = await providerDriver.sendMessage(
      clientChatMessage,
      workspaceId,
      providerIntegrationId,
      clientChat,
    );
    this.saveMessage(
      {
        ...clientChatMessage,
        providerMessageId,
      },
      workspaceId,
    );
    return providerMessageId;
  }

  async updateChat(
    clientChatId: string,
    data: Partial<ClientChatWorkspaceEntity>,
    workspaceId: string,
  ): Promise<UpdateResult | null> {
    try {
      const clientChatRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
          workspaceId,
          'clientChat',
          { shouldBypassPermissionChecks: true },
        );
      const updatedClientChat = await clientChatRepository.update(
        clientChatId,
        data,
      );
      return updatedClientChat;
    } catch (error) {
      this.logger.error('Error updating chat:', error);
      return null;
    }
  }

  async transferService(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
  ): Promise<void> {
    if (
      clientChatMessage.event !== ClientChatMessageEvent.TRANSFER_TO_AGENT &&
      clientChatMessage.event !== ClientChatMessageEvent.TRANSFER_TO_SECTOR
    ) {
      this.logger.error('Must be transfer event');
      return;
    }

    //from is the agent id or sector id, to is the agent id or sector id
    const clientChatRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
        workspaceId,
        'clientChat',
        { shouldBypassPermissionChecks: true },
      );
    const clientChat = await clientChatRepository.findOne({
      where: { id: clientChatMessage.clientChatId },
      relations: ['person'],
    });
    if (!clientChat) {
      this.logger.error('Chat not found ' + clientChatMessage.clientChatId);
      return;
    }
    clientChat.unreadMessagesCount = 1;
    if (clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_SECTOR) {
      //chat disappears from agent who transferred it (published to the agent's sector channel)
      await this.clientChatMessageService.publishChatDeleted(
        clientChat,
        clientChat.sectorId,
      );
      //change sector to the new sector
      clientChat.sectorId = clientChatMessage.to;
      clientChat.agentId = null;
      clientChat.status = ClientChatStatus.UNASSIGNED;
      //chat appears in sector who transferred it (published to the sector channel)
      await this.clientChatMessageService.publishChatCreated(
        clientChat,
        clientChatMessage.to,
      );
    }
    if (clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_AGENT) {
      //chat disappears from agent who transferred it (published to the agent's sector channel)
      await this.clientChatMessageService.publishChatDeleted(
        clientChat,
        clientChat.sectorId,
      );
      const agent = await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<AgentWorkspaceEntity>(
          workspaceId,
          'agent',
          { shouldBypassPermissionChecks: true },
        )
      ).findOne({
        where: { id: clientChatMessage.to },
      });
      if (!agent) this.logger.error('Agent not found ' + clientChatMessage.to);
      clientChat.agentId = agent?.id ?? null;
      clientChat.status = ClientChatStatus.ASSIGNED;
      if (agent) {
        clientChat.sectorId = agent.sectorId;
      }
      //chat appears in agent who transferred it (published to the agent's sector channel)
      await this.clientChatMessageService.publishChatCreated(
        clientChat,
        clientChat.sectorId,
      );
    }
    await this.updateChat(clientChat.id, clientChat, workspaceId);
    const messageRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
        workspaceId,
        'clientChatMessage',
        { shouldBypassPermissionChecks: true },
      );
    await messageRepository.save({
      ...clientChatMessage,
    });
  }

  async handleEventMessage(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
  ): Promise<void> {
    //TRANSFER EVENTS
    if (
      clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_SECTOR ||
      clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_AGENT
    ) {
      this.transferService(clientChatMessage, workspaceId);
    } else if (
      clientChatMessage.event === ClientChatMessageEvent.CHATBOT_START
    ) {
      await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
          workspaceId,
          'clientChat',
          { shouldBypassPermissionChecks: true },
        )
      ).update(clientChatMessage.clientChatId, {
        status: ClientChatStatus.CHATBOT,
      });
      await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          workspaceId,
          'clientChatMessage',
          { shouldBypassPermissionChecks: true },
        )
      ).save({
        ...clientChatMessage,
        createdAt: new Date().toISOString(),
        providerMessageId: v4(),
      });
      this.clientChatMessageService.publishMessageCreated(
        {
          ...clientChatMessage,
          createdAt: new Date().toISOString(),
          providerMessageId: v4(),
        },
        clientChatMessage.clientChatId,
      );
    } else if (clientChatMessage.event === ClientChatMessageEvent.END) {
      const clientChatRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
          workspaceId,
          'clientChat',
          { shouldBypassPermissionChecks: true },
        );
      const clientChat = await clientChatRepository.findOne({
        where: { id: clientChatMessage.clientChatId },
        relations: ['person'],
      });
      if (!clientChat) {
        this.logger.error('Client chat not found');
        return;
      }
      clientChat.status = ClientChatStatus.FINISHED;
      await clientChatRepository.save(clientChat);
      this.clientChatMessageService.publishChatDeleted(
        clientChat,
        clientChat.sectorId,
      );
      await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          workspaceId,
          'clientChatMessage',
          { shouldBypassPermissionChecks: true },
        )
      ).save({
        ...clientChatMessage,
      });
    } else if (clientChatMessage.event === ClientChatMessageEvent.ABANDONED) {
      await this.saveMessage(
        {
          ...clientChatMessage,
          providerMessageId: v4(),
        },
        workspaceId,
      );
      await this.updateChat(
        clientChatMessage.clientChatId,
        {
          status: ClientChatStatus.ABANDONED,
        },
        workspaceId,
      );
      this.logger.warn(
        `Chat ${clientChatMessage.clientChatId} marked as abandoned`,
      );
      return;
    } else if (clientChatMessage.event === ClientChatMessageEvent.START) {
      const clientChatRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
          workspaceId,
          'clientChat',
          { shouldBypassPermissionChecks: true },
        );
      const clientChat = await clientChatRepository.findOne({
        where: { id: clientChatMessage.clientChatId },
        relations: ['person'],
      });
      if (!clientChat) {
        this.logger.error('Client chat not found');
        return;
      }
      clientChat.status = ClientChatStatus.ASSIGNED;
      clientChat.agentId = clientChatMessage.from;
      clientChat.sectorId = clientChatMessage.to;
      await clientChatRepository.update(clientChat.id, clientChat);
      await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          workspaceId,
          'clientChatMessage',
          { shouldBypassPermissionChecks: true },
        )
      ).save({
        ...clientChatMessage,
        createdAt: new Date().toISOString(),
        providerMessageId: v4(),
      });
      this.clientChatMessageService.publishChatUpdated(
        clientChat,
        clientChat.sectorId,
      );
      this.clientChatMessageService.publishMessageCreated(
        {
          ...clientChatMessage,
          createdAt: new Date().toISOString(),
          providerMessageId: v4(),
        },
        clientChat.id,
      );
    }
  }

  async saveMessage(
    clientChatMessage: Omit<
      ClientChatMessageWorkspaceEntity,
      'createdAt' | 'updatedAt' | 'id' | 'clientChat' | 'deletedAt'
    >,
    workspaceId: string,
  ): Promise<ClientChatMessageWorkspaceEntity | null> {
    this.logger.warn('Redis client: ' + this.redisClient.getClient());
    try {
      const messageRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          workspaceId,
          'clientChatMessage',
          { shouldBypassPermissionChecks: true },
        );
      if (clientChatMessage.attachmentUrl) {
        clientChatMessage.attachmentUrl =
          clientChatMessage.attachmentUrl.replace(
            this.environmentService.get('SERVER_URL') + '/files/',
            '',
          );
      }
      const message = await messageRepository.save(clientChatMessage);

      const clientChatRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
          workspaceId,
          'clientChat',
          { shouldBypassPermissionChecks: true },
        );
      const clientChat = await clientChatRepository.findOne({
        where: { id: message.clientChatId },
        relations: ['person', 'sector'],
      });

      if (!clientChat) {
        this.logger.error('Client chat not found');
        return null;
      }

      if (
        clientChat.sector.abandonmentInterval &&
        message.event !== ClientChatMessageEvent.ABANDONED
      ) {
        await this.handleAbandonment(
          {
            chatId: clientChat.id,
            workspaceId: workspaceId,
            clientChat,
          },
          clientChat.sector.abandonmentInterval,
          clientChatMessage,
        );
      }
      if (clientChat.status === ClientChatStatus.ABANDONED) {
        this.updateChat(
          clientChat.id,
          {
            status: ClientChatStatus.ASSIGNED,
          },
          workspaceId,
        );
      }
      if (clientChat.status === ClientChatStatus.FINISHED) {
        //add more integrations here in the future
        const whatsappIntegration = await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
            workspaceId,
            'whatsappIntegration',
            { shouldBypassPermissionChecks: true },
          )
        ).findOne({ where: { id: clientChat.whatsappIntegrationId ?? '' } });

        if (!whatsappIntegration) {
          this.logger.error('Whatsapp integration not found');
          return null;
        }
        clientChat.status = ClientChatStatus.UNASSIGNED;
        clientChat.agentId = null;
        clientChat.sectorId = whatsappIntegration.defaultSectorId;
        this.clientChatMessageService.publishChatCreated(
          clientChat,
          whatsappIntegration.defaultSectorId,
        );
      }
      clientChat.unreadMessagesCount =
        message.fromType === ChatMessageFromType.PERSON
          ? clientChat.unreadMessagesCount + 1
          : 0;

      clientChat.lastMessageType = message.type;
      clientChat.lastMessageDate = new Date();
      clientChat.lastMessagePreview = message.textBody;

      await clientChatRepository.save(clientChat);

      this.clientChatMessageService.publishMessageCreated(
        message,
        clientChat.id,
      );
      return message;
    } catch (error) {
      this.logger.error('Error saving message:', error);
      return null;
    }
  }

  async updateMessage(
    providerMessageId: string,
    data: Partial<ClientChatMessageWorkspaceEntity>,
    workspaceId: string,
  ): Promise<ClientChatMessageWorkspaceEntity | null> {
    try {
      const messageRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          workspaceId,
          'clientChatMessage',
          { shouldBypassPermissionChecks: true },
        );
      const message = await messageRepository.findOne({
        where: {
          providerMessageId,
        },
      });
      if (!message) {
        this.logger.error('Message not found');
        return null;
      }
      const updatedMessage = {
        ...message,
        ...data,
      };
      this.clientChatMessageService.publishMessageUpdated(
        {
          ...updatedMessage,
          createdAt: new Date().toISOString(),
        },
        updatedMessage.clientChatId,
      );
      const result = await messageRepository.save(updatedMessage);
      return result;
    } catch (error) {
      this.logger.error('Error updating message:', error);
      return null;
    }
  }

  private getProviderDriver(
    provider: ChatIntegrationProvider,
  ): ChatProviderDriver {
    const drivers = {
      [ChatIntegrationProvider.WHATSAPP]: new WhatsAppDriver(
        this.twentyORMGlobalManager,
        this.environmentService,
      ),
    };
    return drivers[provider];
  }

  async sendMessageNotification(externalIds: string[], message: string) {
    const ONESIGNAL_APPID = this.environmentService.get('ONESIGNAL_APP_ID');
    const ONESIGNAL_REST_API_KEY = this.environmentService.get(
      'ONESIGNAL_REST_API_KEY',
    );

    const headers = {
      Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    };

    try {
      const body = {
        app_id: ONESIGNAL_APPID,
        include_aliases: {
          external_id: [externalIds],
        },
        target_channel: 'push',
        isAnyWeb: true,
        headings: { en: message },
        contents: { en: message },
      };

      await axios.post('https://onesignal.com/api/v1/notifications', body, {
        headers,
      });

      return true;
    } catch (error) {
      this.logger.error('Error sending push notification:', error);
      return false;
    }
  }

  async executeAbandonment(
    chatId: string,
    workspaceId: string,
    clientChat: ClientChatWorkspaceEntity,
  ): Promise<void> {
    await this.sendMessage(
      {
        clientChatId: chatId,
        event: ClientChatMessageEvent.ABANDONED,
        from: clientChat.sectorId ?? '',
        fromType: ChatMessageFromType.SECTOR,
        to: clientChat.agentId ?? '',
        toType: ChatMessageToType.AGENT,
        textBody: null,
        type: ChatMessageType.EVENT,
        attachmentUrl: null,
        caption: null,
        deliveryStatus: ChatMessageDeliveryStatus.SENT,
        edited: false,
        provider: clientChat.whatsappIntegrationId
          ? ChatIntegrationProvider.WHATSAPP
          : ChatIntegrationProvider.WHATSAPP,
        createdAt: new Date().toISOString(),
        reactions: null,
        repliesTo: null,
      },
      workspaceId,
      clientChat.whatsappIntegrationId ?? '',
    );
    await this.cancelScheduledAbandonment(chatId);
  }

  async scheduleAbandonment(
    jobData: ChatMessageManagerSetAbandonedCronJobData,
    abandonmentInterval: number,
  ): Promise<void> {
    this.activeCronJobs.push(jobData.chatId);
    this.messageQueueService.addCron({
      jobName: this.JOB_NAME,
      data: jobData,
      options: {
        id: jobData.chatId,
        repeat: {
          pattern: `*/${abandonmentInterval} * * * *`,
          limit: 1,
        },
      },
    });
    this.logger.warn(
      `Scheduled abandonment for chat ${jobData.chatId} with interval ${abandonmentInterval}`,
    );
  }

  async cancelScheduledAbandonment(chatId: string): Promise<void> {
    this.activeCronJobs = this.activeCronJobs.filter((job) => job !== chatId);
    this.messageQueueService.removeCron({
      jobName: this.JOB_NAME,
      jobId: chatId,
    });
    this.logger.warn(`Cancelled abandonment for chat ${chatId}`);
  }

  async hasJobScheduled(chatId: string): Promise<boolean> {
    const jobs = await this.queue.getJobs();
    this.logger.warn('Jobs: ' + JSON.stringify(jobs));
    const job = jobs.find(
      (job: Job<ChatMessageManagerSetAbandonedCronJobData>) =>
        job.name === this.JOB_NAME && job.data.chatId === chatId,
    );
    this.logger.warn('Job: ' + JSON.stringify(job));
    return !!job;
  }

  async handleAbandonment(
    jobData: ChatMessageManagerSetAbandonedCronJobData,
    abandonmentInterval: number,
    clientChatMessage: ClientChatMessage,
  ): Promise<void> {
    this.logger.warn(
      'Handling abandonment scheduling for chat',
      jobData.chatId,
    );
    if (
      jobData.clientChat.status === ClientChatStatus.CHATBOT ||
      jobData.clientChat.status === ClientChatStatus.UNASSIGNED
    ) {
      //cancel if any
      await this.cancelScheduledAbandonment(jobData.chatId);
      return;
    }
    //TODO: get from future clientChatConfig entity
    if (clientChatMessage.fromType === ChatMessageFromType.AGENT) {
      await this.cancelScheduledAbandonment(jobData.chatId);
      return;
    }
    if (clientChatMessage.fromType === ChatMessageFromType.PERSON) {
      if (await this.hasJobScheduled(jobData.chatId)) {
        //there is already a job scheduled for this chat. do nothing.
        this.logger.warn(
          `Abandonment job already scheduled for chat ${jobData.chatId}. Doing nothing...`,
        );
        return;
      }
      //last message was from person, and there was no job scheduled for this chat. schedule a new job.
      this.logger.warn(`Scheduling abandonment for chat ${jobData.chatId}`);
      await this.scheduleAbandonment(jobData, abandonmentInterval);
      return;
    }
    if (clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_AGENT) {
      if (await this.hasJobScheduled(jobData.chatId)) {
        await this.cancelScheduledAbandonment(jobData.chatId);
        await this.scheduleAbandonment(jobData, abandonmentInterval);
      }
      //last message was transfer, and there was no job scheduled for this chat. do nothing
      return;
    }
    this.logger.warn(
      `Abandonment job already scheduled for chat ${jobData.chatId}. Doing nothing...`,
    );
    return;
  }
}
