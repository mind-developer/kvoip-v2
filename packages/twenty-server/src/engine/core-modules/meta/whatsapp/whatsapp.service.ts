/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import { Firestore } from 'firebase/firestore';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { SaveClientChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-save.job';
import { SaveClientChatMessageJobData } from 'src/engine/core-modules/chat-message-manager/types/saveChatMessageJobData';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WhatsappEmmitWaitingStatusJobProps } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-waiting-status.job';
import { FormattedWhatsAppMessage } from 'src/engine/core-modules/meta/whatsapp/types/WhatsAppMessage';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { createRelatedPerson } from 'src/engine/core-modules/meta/whatsapp/utils/createRelatedPerson';
import { whatsAppMessageToClientChatMessage } from 'src/engine/core-modules/meta/whatsapp/utils/whatsAppMessageToClientChatMessage';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';
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
  private META_API_URL = this.environmentService.get('META_API_URL');
  private firestoreDb: Firestore;
  protected readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private readonly environmentService: TwentyConfigService,
    public readonly googleStorageService: GoogleStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly ChatbotRunnerService: ChatbotRunnerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fileService: FileService,
    @InjectMessageQueue(MessageQueue.chatMessageManagerSendMessageQueue)
    private sendMessageQueue: MessageQueueService,
    @InjectMessageQueue(MessageQueue.chatMessageManagerSaveMessageQueue)
    private saveMessageQueue: MessageQueueService,
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
        'whatsapp',
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
    const providerContactId = message.fromMe ? message.to : message.from;
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
      relations: ['agent', 'sector'],
    });

    if (!clientChat) {
      const personRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
          workspaceId,
          'person',
          { shouldBypassPermissionChecks: true },
        );
      const person = await personRepository.save(
        createRelatedPerson(
          message.contactName
            ? {
                firstName: message.contactName?.split(' ')[0] ?? '',
                lastName: message.contactName?.split(' ')[1] ?? '',
              }
            : {
                firstName: message.fromMe ? message.to : message.from,
                lastName: '',
              },
          providerContactId,
          message.senderAvatarUrl ?? null,
          ChatIntegrationProvider.WHATSAPP,
          'Via WhatsApp',
        ),
      );
      clientChat = await clientChatRepository.save({
        providerContactId,
        person,
        whatsappIntegration: {
          id: integrationId,
        },
        status: ClientChatStatus.UNASSIGNED,
      });
    }

    if (!clientChat?.id)
      throw new InternalServerError(
        'No chat found, and fallback chat creation failed',
      );

    this.saveMessageQueue.add<SaveClientChatMessageJobData>(
      SaveClientChatMessageJob.name,
      {
        chatMessage: whatsAppMessageToClientChatMessage(message, clientChat),
        workspaceId,
      },
    );

    //initialize chatbot runner if needed
    const whatsappIntegration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsapp',
        { shouldBypassPermissionChecks: true },
      )
    ).findOneBy({ id: integrationId });

    if (
      clientChat.status === ClientChatStatus.UNASSIGNED &&
      !message.fromMe &&
      whatsappIntegration
    ) {
      const chatbot = await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChatbotWorkspaceEntity>(
          workspaceId,
          'chatbot',
          { shouldBypassPermissionChecks: true },
        )
      ).findOneBy({ id: whatsappIntegration?.chatbotId ?? '' });

      if (!chatbot) return;

      const baseEventMessage = {
        chatId: clientChat.id,
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
      } as ClientChatMessage;

      let executor = this.ChatbotRunnerService.getExecutor(clientChat.id);
      if (executor) {
        executor.runFlow(message.textBody);
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
          }
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
        },
      });
      executor.runFlow(message.textBody);
    }
  }

  async sendNotification(externalIds: string[], message: string) {
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
        'whatsapp',
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
