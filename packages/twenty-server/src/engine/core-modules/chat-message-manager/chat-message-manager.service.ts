/* @kvoip-woulz proprietary */
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ChatProviderDriver } from 'src/engine/core-modules/chat-message-manager/drivers/interfaces/chat-provider-driver-interface';
import { WhatsAppDriver } from 'src/engine/core-modules/chat-message-manager/drivers/whatsapp.driver';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
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
  ChatMessageFromType,
  ClientChatMessage,
  ClientChatMessageEvent,
  ClientChatStatus,
} from 'twenty-shared/types';
import { UpdateResult } from 'typeorm';
import { v4 } from 'uuid';

@Injectable()
export class ChatMessageManagerService {
  private readonly logger = new Logger(ChatMessageManagerService.name);
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
    private readonly clientChatMessageService: ClientChatMessageService,
  ) {}

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
      this.logger.error('Person not found for client chat:', clientChat.id);
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
      clientChat.sectorId!,
    );
  }

  async sendMessage(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
    providerIntegrationId: string,
  ): Promise<string> {
    if (clientChatMessage.event) {
      this.handleEventMessage(clientChatMessage, workspaceId);
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
    if (!clientChat) throw new Error('Client chat not found');
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
  ): Promise<UpdateResult> {
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
  }

  async transferService(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
  ): Promise<void> {
    if (
      clientChatMessage.event !== ClientChatMessageEvent.TRANSFER_TO_AGENT &&
      clientChatMessage.event !== ClientChatMessageEvent.TRANSFER_TO_SECTOR
    )
      throw new Error('Must be transfer event');

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
    if (!clientChat)
      throw new Error('Chat not found ' + clientChatMessage.clientChatId);
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
      if (!agent) throw new Error('Agent not found ' + clientChatMessage.to);
      clientChat.agentId = agent.id;
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
    }
    if (clientChatMessage.event === ClientChatMessageEvent.END) {
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
      if (!clientChat) throw new Error('Client chat not found');
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
    }
    if (clientChatMessage.event === ClientChatMessageEvent.START) {
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
      if (!clientChat) throw new Error('Client chat not found');
      clientChat.status = ClientChatStatus.ASSIGNED;
      clientChat.agentId = clientChatMessage.from;
      clientChat.sectorId = clientChatMessage.to;
      await clientChatRepository.update(clientChat.id, clientChat);
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
  ): Promise<ClientChatMessageWorkspaceEntity> {
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
        relations: ['person'],
      });

      if (!clientChat) throw new Error('Client chat not found');
      if (clientChat.status === ClientChatStatus.FINISHED) {
        //add more integrations here in the future
        const whatsappIntegration = await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
            workspaceId,
            'whatsappIntegration',
            { shouldBypassPermissionChecks: true },
          )
        ).findOne({ where: { id: clientChat.whatsappIntegrationId ?? '' } });

        if (!whatsappIntegration)
          throw new Error('Whatsapp integration not found');

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
        message.clientChatId,
      );
      return message;
    } catch (error) {
      this.logger.error('Error saving message:', error);
      throw error;
    }
  }

  async updateMessage(
    providerMessageId: string,
    data: Partial<ClientChatMessageWorkspaceEntity>,
    workspaceId: string,
  ): Promise<ClientChatMessageWorkspaceEntity> {
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
      if (!message) throw new Error('Message not found');
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
      throw new Error('Error updating message: ' + error);
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

  // async sendWhatsAppTemplate(
  //   input: SendWhatsAppTemplateInput,
  //   workspaceId: string,
  // ) {
  //   const integration = await (
  //     await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
  //       workspaceId,
  //       'whatsapp',
  //     )
  //   ).findOne({ where: { id: input.integrationId } });

  //   if (!integration) {
  //     throw new Error('WhatsApp integration not found');
  //   }

  //   const fields: any = {
  //     messaging_product: 'whatsapp',
  //     recipient_type: 'individual',
  //     to: input.to,
  //     type: 'template',
  //     template: {
  //       name: input.templateName,
  //       language: {
  //         code: input.language,
  //       },
  //     },
  //   };

  //   const url = `${this.META_API_URL}/${integration.phoneId}/messages`;
  //   const headers = {
  //     Authorization: `Bearer ${integration.accessToken}`,
  //     'Content-Type': 'application/json',
  //   };

  //   try {
  //     await axios.post(url, fields, { headers });
  //     return true;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Failed to send template message',
  //       error.message,
  //     );
  //   }
  // }

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
    } catch (error) {}
  }
}
