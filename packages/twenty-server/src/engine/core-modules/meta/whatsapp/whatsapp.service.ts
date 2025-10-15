/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, Logger } from '@nestjs/common';

import axios from 'axios';
import { v4 } from 'uuid';

import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { SaveClientChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-save.job';
import { SaveClientChatMessageJobData } from 'src/engine/core-modules/chat-message-manager/types/saveChatMessageJobData';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WhatsappEmmitWaitingStatusJobProps } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-waiting-status.job';
import { FormattedWhatsAppMessage } from 'src/engine/core-modules/meta/whatsapp/types/FormattedWhatsAppMessage';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { createRelatedPerson } from 'src/engine/core-modules/meta/whatsapp/utils/createRelatedPerson';
import { whatsAppMessageToClientChatMessage } from 'src/engine/core-modules/meta/whatsapp/utils/whatsAppMessageToClientChatMessage';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';
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

export class WhatsAppService {
  private META_API_URL = this.twentyConfigService.get('META_API_URL');
  protected readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    public readonly googleStorageService: GoogleStorageService,
    private readonly ChatbotRunnerService: ChatbotRunnerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.chatMessageManagerSendMessageQueue)
    private sendMessageQueue: MessageQueueService,
    @InjectMessageQueue(MessageQueue.chatMessageManagerSaveMessageQueue)
    private saveMessageQueue: MessageQueueService,
    private readonly clientChatMessageService: ClientChatMessageService,
    private readonly chatMessageManagerService: ChatMessageManagerService,
  ) {}

  async getWhatsappTemplates(
    integrationId: string,
    workspaceId: string,
  ): Promise<WhatsappTemplatesResponse> {
    if (!integrationId) {
      // eslint-disable-next-line no-console
      return { templates: [] };
    }

    const whatsappIntegrationRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsappIntegration',
      );

    const integration = await whatsappIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new InternalServerError('Whatsapp integration not found');
    }

    const url = `${this.META_API_URL}/${integration?.businessAccountId}/message_templates`;

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    let allTemplates = [];

    try {
      const response = await axios.get(url, { headers });

      const { data } = response.data;

      allTemplates = data.filter(
        (template: any) => template.status === 'APPROVED',
      );

      return { templates: allTemplates };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get Business ID ${integration?.businessAccountId} templates`,
        error.message,
      );
    }
  }

  async sendMessage(jobName: string, jobOptions: SendChatMessageQueueData) {
    this.sendMessageQueue.add<SendChatMessageQueueData>(jobName, jobOptions);
  }

  async saveMessage(
    message: FormattedWhatsAppMessage,
    integrationId: string,
    workspaceId: string,
  ) {
    try {
      const providerContactId = message.remoteJid;
      const clientChatRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
          workspaceId,
          'clientChat',
          { shouldBypassPermissionChecks: true },
        );
      let clientChat = await clientChatRepository.findOne({
        where: {
          whatsappIntegrationId: integrationId,
          providerContactId,
        },
        relations: ['agent', 'sector', 'whatsappIntegration'],
      });

      if (!clientChat) {
        const personRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
            workspaceId,
            'person',
            { shouldBypassPermissionChecks: true },
          );
        const whatsappIntegration = await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
            workspaceId,
            'whatsappIntegration',
          )
        ).findOne({ where: { id: integrationId } });
        const person = await personRepository.save(
          createRelatedPerson(
            message.fromMe
              ? {
                  firstName: `WhatsApp (${message.remoteJid})`,
                  lastName: '',
                }
              : {
                  firstName: message.contactName?.split(' ')[0] ?? '',
                  lastName: message.contactName?.split(' ')[1] ?? '',
                },
            //TODO: parse number to get codes
            message.remoteJid,
            message.senderAvatarUrl ?? null,
            ChatIntegrationProvider.WHATSAPP,
            'Via WhatsApp (Chat)',
          ),
        );
        clientChat = await clientChatRepository.save({
          person,
          providerContactId,
          whatsappIntegration: {
            id: integrationId,
          },
          sector: {
            id: whatsappIntegration?.defaultSectorId ?? undefined,
          },
          lastMessageType: message.type,
          lastMessageDate: new Date(),
          lastMessagePreview: message.textBody,
          status: ClientChatStatus.UNASSIGNED,
        });

        this.clientChatMessageService.publishChatCreated(
          {
            ...clientChat,
            messengerIntegrationId: null,
            telegramIntegrationId: null,
          },
          whatsappIntegration?.defaultSectorId!,
        );
      }

      if (!clientChat?.id)
        throw new InternalServerError(
          'No chat found, and fallback chat creation failed',
        );

      this.clientChatMessageService.publishMessageCreated(
        {
          ...whatsAppMessageToClientChatMessage(message, clientChat),
          createdAt: new Date().toISOString(),
        },
        clientChat.id,
      );
      await this.chatMessageManagerService.saveMessage(
        whatsAppMessageToClientChatMessage(message, clientChat),
      );

      await clientChatRepository.update(clientChat.id, {
        lastMessageType: message.type,
        lastMessageDate: new Date(),
        lastMessagePreview: message.textBody,
      });

      const updatedClientChat = await clientChatRepository.findOne({
        where: { id: clientChat.id },
        relations: ['person', 'sector', 'whatsappIntegration'],
      });

      this.clientChatMessageService.publishChatUpdated(
        {
          ...updatedClientChat!,
          messengerIntegrationId: null,
          telegramIntegrationId: null,
        },
        clientChat.sectorId!,
      );

      //initialize chatbot runner if needed
      const whatsappIntegration = await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
          workspaceId,
          'whatsappIntegration',
          { shouldBypassPermissionChecks: true },
        )
      ).findOneBy({ id: integrationId });

      if (
        clientChat.status === ClientChatStatus.UNASSIGNED &&
        !message.fromMe &&
        whatsappIntegration &&
        whatsappIntegration.chatbotId
      ) {
        const chatbot = await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChatbotWorkspaceEntity>(
            workspaceId,
            'chatbot',
            { shouldBypassPermissionChecks: true },
          )
        ).findOneBy({ id: whatsappIntegration.chatbotId });

        if (!chatbot) return;

        const baseEventMessage: ClientChatMessage = {
          clientChatId: clientChat.id,
          from: chatbot.name,
          fromType: ChatMessageFromType.CHATBOT,
          to: clientChat.person.id,
          toType: ChatMessageToType.PERSON,
          provider: ChatIntegrationProvider.WHATSAPP,
          providerMessageId: message.id,
          type: ChatMessageType.EVENT,
          textBody: null,
          caption: null,
          deliveryStatus: ChatMessageDeliveryStatus.DELIVERED,
          edited: false,
          attachmentUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: 'now',
          event: null,
        };

        let executor = this.ChatbotRunnerService.getExecutor(clientChat.id);
        if (executor) {
          executor.runFlow(message.textBody ?? '');
          return true;
        }

        this.saveMessageQueue.add<SaveClientChatMessageJobData>(
          SaveClientChatMessageJob.name,
          {
            chatMessage: {
              ...baseEventMessage,
              event: ClientChatMessageEvent.CHATBOT_START,
            },
            workspaceId,
          },
        );

        clientChatRepository.update(clientChat.id, {
          status: ClientChatStatus.CHATBOT,
        });

        const sectors = await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<SectorWorkspaceEntity>(
            workspaceId,
            'sector',
          )
        ).find();

        executor = this.ChatbotRunnerService.createExecutor({
          provider: ChatIntegrationProvider.WHATSAPP,
          providerIntegrationId: integrationId,
          clientChat,
          workspaceId,
          chatbotName: chatbot?.name || 'Chatbot',
          chatbot: {
            ...chatbot,
            workspace: { id: workspaceId },
          },
          sectors: sectors,
          onFinish: (_, sectorId: string) => {
            if (sectorId) {
              clientChatRepository.update(clientChat.id, {
                sector: { id: sectorId },
              });
              this.saveMessageQueue.add<SaveClientChatMessageJobData>(
                SaveClientChatMessageJob.name,
                {
                  chatMessage: {
                    ...baseEventMessage,
                    event: ClientChatMessageEvent.TRANSFER_TO_SECTOR,
                  },
                  workspaceId,
                },
              );
              clientChatRepository.update(clientChat.id, {
                status: ClientChatStatus.ASSIGNED_TO_AGENT,
              });
              return;
            }
            // if (agentId) {
            //   clientChatRepository.update(clientChat.id, {
            //     status: ClientChatStatus.ASSIGNED_TO_AGENT,
            //   });
            // }
            this.saveMessageQueue.add<SaveClientChatMessageJobData>(
              SaveClientChatMessageJob.name,
              {
                chatMessage: {
                  ...baseEventMessage,
                  event: ClientChatMessageEvent.CHATBOT_END,
                },
                workspaceId,
              },
            );
            this.ChatbotRunnerService.clearExecutor(clientChat.id);
            clientChatRepository.update(clientChat.id, {
              status: ClientChatStatus.UNASSIGNED,
            });
          },
        });
        executor.runFlow(message.textBody ?? '');
      }
    } catch (error) {
      this.logger.error('Error saving message:', error);
    }
  }

  async updateMessage(
    providerMessageId: string,
    data: Partial<ClientChatMessage>,
    workspaceId: string,
  ) {
    try {
      const messageRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          workspaceId,
          'clientChatMessage',
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

  async sendNotification(externalIds: string[], message: string) {
    const ONESIGNAL_APPID = this.twentyConfigService.get('ONESIGNAL_APP_ID');
    const ONESIGNAL_REST_API_KEY = this.twentyConfigService.get(
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

      const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        body,
        {
          headers,
        },
      );

      return true;
    } catch (error) {
      this.logger.error(
        'Notification error:',
        error.response?.data || error.message,
      );

      return false;
    }
  }

  async downloadMedia(
    mediaId: string,
    integrationId: string,
    phoneNumber: string,
    type: string,
    workspaceId: string,
  ) {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsappIntegration',
      );

    const integration = await whatsappRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      // eslint-disable-next-line no-console
      console.error('Integration not found for integrationId:', integrationId);

      return;
    }

    const url = `${this.META_API_URL}/${mediaId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
        },
      });

      const data = response.data;

      if (!data) {
        throw new Error('Media URL not found.');
      }

      data.url = data.url.replace(/\\/g, '');
      data.mime_type = data.mime_type.replace(/\\/g, '');

      const mediaResponse = await axios.get(data.url, {
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      const mediaBuffer = Buffer.from(mediaResponse.data, 'binary');

      const file: { originalname: string; buffer: Buffer; mimetype: string } = {
        originalname: `${phoneNumber}_${v4()}`,
        buffer: mediaBuffer,
        mimetype: data.mime_type,
      };

      const fileUrl = await this.googleStorageService.uploadFileToBucket(
        workspaceId,
        type,
        file,
        false,
      );

      return fileUrl;
    } catch (error) {
      const err = `Error downloading media: ${error.message}`;

      throw new Error(err);
    }
  }

  async getWorkspaceWhatsappChatsMapToReassign() {
    // TODO: Implement
  }

  async handleChatsWaitingStatus(data: WhatsappEmmitWaitingStatusJobProps) {
    // TODO: Implement
  }

  async getWorkspaceWhatsappResolvedChatsMapToReassign() {
    // TODO: Implement
  }
}
