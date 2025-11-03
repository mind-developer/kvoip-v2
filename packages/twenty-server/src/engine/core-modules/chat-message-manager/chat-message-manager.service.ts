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
import { ClientChatMessageNoBaseFields } from 'src/engine/core-modules/chat-message-manager/types/ClientChatMessageNoBaseFields';
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
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';
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
import { v4 } from 'uuid';

@Injectable({ scope: Scope.DEFAULT })
export class ChatMessageManagerService {
  private readonly logger = new Logger(ChatMessageManagerService.name);
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
    this.redisClientInstance = this.redisClient.getClient();
    this.queue = new Queue(MessageQueue.cronQueue, {
      connection: this.redisClientInstance,
    });
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
    const sector = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<SectorWorkspaceEntity>(
        event.workspaceId,
        'sector',
        { shouldBypassPermissionChecks: true },
      )
    ).findOne({ where: { id: clientChat.sectorId } });
    if (!sector) {
      this.logger.error('Sector not found for client chat:', clientChat.id);
      return;
    }
    clientChat.sector = sector;
    clientChat.sectorId = sector?.id ?? null;
    clientChat.person = person;
    await this.clientChatMessageService.publishChatCreated(
      clientChat,
      clientChat.sectorId,
    );
  }

  @OnDatabaseBatchEvent('clientChatMessage', DatabaseEventAction.UPDATED)
  async onClientChatMessageUpdated(
    event: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ClientChatMessageWorkspaceEntity>
    >,
  ) {
    const updatedUnreadMessagesCount =
      event.events[0].properties.updatedFields?.includes('unreadMessagesCount');
    if (updatedUnreadMessagesCount) {
      const clientChat = await this.getChatByClientChatId(
        event.events[0].properties.after.clientChatId,
        event.workspaceId,
      );
      if (!clientChat) {
        this.logger.error('Client chat not found');
        return;
      }
      this.clientChatMessageService.publishChatUpdated(
        clientChat,
        clientChat.sectorId,
      );
    }
  }

  async sendMessage(
    clientChatMessage: Omit<ClientChatMessageNoBaseFields, 'providerMessageId'>,
    workspaceId: string,
    providerIntegrationId: string,
  ): Promise<string | null> {
    if (clientChatMessage.event) {
      await this.handleEventMessage(clientChatMessage, workspaceId);
      return v4();
    }
    const providerDriver = this.getProviderDriver(clientChatMessage.provider);
    const clientChat = await this.getChatByClientChatId(
      clientChatMessage.clientChatId,
      workspaceId,
    );
    if (!clientChat) {
      this.logger.error('Client chat not found');
      return null;
    }
    if (clientChatMessage.type === ChatMessageType.TEMPLATE) {
      await this.getProviderDriver(
        clientChatMessage.provider,
      ).sendTemplateMessage(
        clientChatMessage,
        workspaceId,
        providerIntegrationId,
        clientChat,
      );
      return v4();
    }
    if (clientChat.status !== ClientChatStatus.ASSIGNED) {
      this.logger.error('Client chat not assigned');
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
    publishTo: 'sector' | 'admin' | 'all' = 'all',
  ): Promise<ClientChatWorkspaceEntity | null> {
    try {
      const clientChatRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
          workspaceId,
          'clientChat',
          { shouldBypassPermissionChecks: true },
        );
      const clientChat = await clientChatRepository.findOne({
        where: { id: clientChatId },
        relations: ['sector', 'agent', 'person'],
      });
      if (!clientChat) {
        this.logger.error('Client chat not found');
        return null;
      }
      const updatedClientChat = {
        ...clientChat,
        ...data,
      };
      await clientChatRepository.update(clientChat.id, updatedClientChat);
      await this.clientChatMessageService.publishChatUpdated(
        updatedClientChat,
        updatedClientChat.sectorId!,
        publishTo,
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

    //message.from is the agent id or sector id, message.to is the agent id or sector id
    const clientChat = await this.getChatByClientChatId(
      clientChatMessage.clientChatId,
      workspaceId,
    );
    if (!clientChat) {
      this.logger.error('Chat not found ' + clientChatMessage.clientChatId);
      return;
    }
    clientChat.unreadMessagesCount = 1;
    if (clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_SECTOR) {
      const sector = await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<SectorWorkspaceEntity>(
          workspaceId,
          'sector',
          { shouldBypassPermissionChecks: true },
        )
      ).findOne({ where: { id: clientChatMessage.to } });
      //chat disappears from agent who transferred it (published to the agent's sector channel)
      await this.clientChatMessageService.publishChatDeleted(
        clientChat,
        clientChat.sectorId,
        'sector',
      );
      if (!sector) {
        this.logger.error('Sector not found ' + clientChatMessage.to);
        return;
      }
      //change sector to the new sector
      clientChat.agentId = null;
      clientChat.agent = null;
      clientChat.status = ClientChatStatus.UNASSIGNED;
      clientChat.sector = sector;
      clientChat.sectorId = sector.id;
      //chat appears in sector that transferred it (published to the sector channel)
      await this.clientChatMessageService.publishChatCreated(
        clientChat,
        clientChatMessage.to,
        'sector',
      );
      await this.updateChat(clientChat.id, clientChat, workspaceId);
      return;
    }
    if (clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_AGENT) {
      if (clientChat.agentId === clientChatMessage.to) {
        this.logger.error(
          'Chat already assigned to agent ' + clientChatMessage.to,
        );
        return;
      }
      //chat disappears from agent who transferred it (published to the agent's sector channel)
      await this.clientChatMessageService.publishChatDeleted(
        clientChat,
        clientChat.sectorId,
        'sector',
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
      if (!agent) {
        this.logger.error('Agent not found ' + clientChatMessage.to);
        return;
      }
      clientChat.agent = agent;
      clientChat.agentId = agent.id;
      clientChat.status = ClientChatStatus.ASSIGNED;
      clientChat.sectorId = agent.sectorId;
      await this.clientChatMessageService.publishChatCreated(
        clientChat,
        clientChat.sectorId,
        'sector',
      );
      return;
    }
    await this.updateChat(clientChat.id, clientChat, workspaceId, 'admin');
  }

  async handleEventMessage(
    clientChatMessage: Omit<ClientChatMessageNoBaseFields, 'providerMessageId'>,
    workspaceId: string,
  ): Promise<void> {
    //TRANSFER EVENTS
    if (
      clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_SECTOR ||
      clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_AGENT
    ) {
      await this.transferService(clientChatMessage, workspaceId);
      await this.saveMessage(
        { ...clientChatMessage, providerMessageId: v4() },
        workspaceId,
      );
      return;
    } else if (
      clientChatMessage.event === ClientChatMessageEvent.CHATBOT_START
    ) {
      await this.updateChat(
        clientChatMessage.clientChatId,
        {
          status: ClientChatStatus.CHATBOT,
        },
        workspaceId,
      );
      await this.saveMessage(
        { ...clientChatMessage, providerMessageId: v4() },
        workspaceId,
      );
    } else if (clientChatMessage.event === ClientChatMessageEvent.END) {
      const clientChat = await this.getChatByClientChatId(
        clientChatMessage.clientChatId,
        workspaceId,
      );
      if (!clientChat) {
        this.logger.error('Client chat not found');
        return;
      }
      if (clientChat.status === ClientChatStatus.FINISHED) {
        this.logger.error('Chat already finished');
        return;
      }
      clientChat.status = ClientChatStatus.FINISHED;
      await this.updateChat(clientChat.id, clientChat, workspaceId);
      this.clientChatMessageService.publishChatDeleted(
        clientChat,
        clientChat.sectorId,
      );
      await this.saveMessage(
        { ...clientChatMessage, providerMessageId: v4() },
        workspaceId,
      );
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
      const clientChat = await this.getChatByClientChatId(
        clientChatMessage.clientChatId,
        workspaceId,
      );
      if (!clientChat) {
        this.logger.error('Client chat not found');
        return;
      }
      clientChat.status = ClientChatStatus.ASSIGNED;
      clientChat.agentId = clientChatMessage.from;
      const sector = await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<SectorWorkspaceEntity>(
          workspaceId,
          'sector',
          { shouldBypassPermissionChecks: true },
        )
      ).findOne({ where: { id: clientChatMessage.to } });
      if (!sector) {
        this.logger.error('Sector not found ' + clientChatMessage.to);
        return;
      }
      clientChat.sector = sector;
      clientChat.sectorId = sector.id;
      this.saveMessage(
        {
          ...clientChatMessage,
          providerMessageId: v4(),
        },
        workspaceId,
      );
      await this.updateChat(clientChat.id, clientChat, workspaceId);
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

      const clientChat = await this.getChatByClientChatId(
        message.clientChatId,
        workspaceId,
      );

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
        await this.updateChat(
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

      await this.updateChat(clientChat.id, clientChat, workspaceId);

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
        reactions: null,
        repliesTo: null,
        templateId: null,
        templateLanguage: null,
        templateName: null,
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

  async getChatByClientChatId(
    clientChatId: string,
    workspaceId: string,
  ): Promise<ClientChatWorkspaceEntity | null> {
    return (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
        workspaceId,
        'clientChat',
        { shouldBypassPermissionChecks: true },
      )
    ).findOne({
      where: { id: clientChatId },
      relations: ['sector', 'person', 'agent'],
    });
  }
}
