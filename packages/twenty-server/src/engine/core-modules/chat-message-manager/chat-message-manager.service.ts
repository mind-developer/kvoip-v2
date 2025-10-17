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
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import {
  ChatIntegrationProvider,
  ChatMessageFromType,
  ClientChatMessage,
  ClientChatMessageEvent,
  ClientChatStatus,
} from 'twenty-shared/types';

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
    this.logger.log('Client chat updated:', clientChat);
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
    this.logger.log('Client chat created:', clientChat);
    this.clientChatMessageService.publishChatCreated(
      clientChat,
      clientChat.sectorId!,
    );
  }

  async sendMessage(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
    providerIntegrationId: string,
  ) {
    if (clientChatMessage.event) {
      if (
        clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_SECTOR ||
        clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_AGENT
      ) {
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
          this.logger.error(
            'Client chat not found:',
            clientChatMessage.clientChatId,
          );
          return;
        }
        if (
          clientChatMessage.event === ClientChatMessageEvent.TRANSFER_TO_SECTOR
        ) {
          clientChat.sectorId = clientChatMessage.to;
          clientChat.agentId = null;
          clientChat.status = ClientChatStatus.UNASSIGNED;
        } else {
          clientChat.agentId = clientChatMessage.to;
          clientChat.status = ClientChatStatus.ASSIGNED;
        }
        await clientChatRepository.save(clientChat);
        await this.clientChatMessageService.publishChatDeleted(
          clientChat,
          clientChatMessage.from,
        );
        await this.clientChatMessageService.publishChatCreated(
          clientChat,
          clientChatMessage.to,
        );
      }
    }
    const providerDriver = this.getProviderDriver(clientChatMessage.provider);
    const providerMessageId = await providerDriver.sendMessage(
      clientChatMessage,
      workspaceId,
      providerIntegrationId,
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
  ) {
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

  async saveMessage(
    clientChatMessage: Omit<
      ClientChatMessageWorkspaceEntity,
      'createdAt' | 'updatedAt' | 'id' | 'clientChat' | 'deletedAt'
    >,
    workspaceId: string,
  ) {
    try {
      const messageRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          workspaceId,
          'clientChatMessage',
          { shouldBypassPermissionChecks: true },
        );
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
  ) {
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
      if (!message) return;
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
      await messageRepository.save(updatedMessage);
    } catch (error) {
      this.logger.error('Error updating message:', error);
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
