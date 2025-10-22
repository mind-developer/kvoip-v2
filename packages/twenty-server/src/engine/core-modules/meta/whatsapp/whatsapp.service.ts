/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import axios from 'axios';
import { v4 } from 'uuid';

import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { FormattedWhatsAppMessage } from 'src/engine/core-modules/meta/whatsapp/types/FormattedWhatsAppMessage';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { createRelatedPerson } from 'src/engine/core-modules/meta/whatsapp/utils/createRelatedPerson';
import { whatsAppMessageToClientChatMessage } from 'src/engine/core-modules/meta/whatsapp/utils/whatsAppMessageToClientChatMessage';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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

@Injectable()
export class WhatsAppService {
  private META_API_URL: string;
  protected readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly environmentService: TwentyConfigService,
    private readonly chatMessageManagerService: ChatMessageManagerService,
    private readonly ChatbotRunnerService: ChatbotRunnerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fileService: FileService,
    private readonly fileMetadataService: FileMetadataService,
  ) {
    this.META_API_URL = this.environmentService.get('META_API_URL');
  }

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
        { shouldBypassPermissionChecks: true },
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
        relations: ['agent', 'sector', 'whatsappIntegration', 'person'],
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
            { shouldBypassPermissionChecks: true },
          )
        ).findOne({ where: { id: integrationId } });

        if (!whatsappIntegration) {
          throw new InternalServerError('Whatsapp integration not found');
        }

        const person = await personRepository.save(
          createRelatedPerson(
            message.fromMe
              ? {
                  firstName: `WhatsApp (${message.senderPhoneNumber ?? message.remoteJid})`,
                  lastName: '',
                }
              : {
                  firstName: message.contactName?.split(' ')[0] ?? '',
                  lastName: message.contactName?.split(' ')[1] ?? '',
                },
            message.senderPhoneNumber ?? providerContactId,
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
            id: whatsappIntegration.defaultSectorId,
          },
          lastMessageType: message.type,
          lastMessageDate: new Date(),
          lastMessagePreview: message.textBody,
          status: ClientChatStatus.UNASSIGNED,
        });
      }

      if (!clientChat) throw new InternalServerError('Client chat not found');

      await this.chatMessageManagerService.saveMessage(
        whatsAppMessageToClientChatMessage(message, clientChat),
        workspaceId,
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
        clientChat.status === ClientChatStatus.UNASSIGNED ||
        (clientChat.status === ClientChatStatus.CHATBOT &&
          !message.fromMe &&
          whatsappIntegration?.chatbotId)
      ) {
        const chatbot = await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChatbotWorkspaceEntity>(
            workspaceId,
            'chatbot',
            { shouldBypassPermissionChecks: true },
          )
        ).findOneBy({ id: whatsappIntegration?.chatbotId ?? '' });
        console.log('initializing chatbot runner with chatbot', chatbot);

        if (!chatbot) {
          console.log('chatbot not found');
          return;
        }
        if (!chatbot.nodes) {
          console.log('chatbot has no nodes');
          return;
        }

        const baseEventMessage: ClientChatMessage = {
          clientChatId: clientChat.id,
          from: chatbot.id,
          fromType: ChatMessageFromType.CHATBOT,
          to: whatsappIntegration?.defaultSectorId ?? '',
          toType: ChatMessageToType.SECTOR,
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
          console.log('executor found');
          executor.runFlow(message.textBody ?? '');
          return true;
        }

        this.chatMessageManagerService.sendMessage(
          {
            ...baseEventMessage,
            event: ClientChatMessageEvent.CHATBOT_START,
          },
          workspaceId,
          integrationId,
        );

        console.log('getting sectors');
        const sectors = await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<SectorWorkspaceEntity>(
            workspaceId,
            'sector',
            { shouldBypassPermissionChecks: true },
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
            console.log('on finish', sectorId);
            if (sectorId) {
              this.chatMessageManagerService.sendMessage(
                {
                  ...baseEventMessage,
                  event: ClientChatMessageEvent.TRANSFER_TO_SECTOR,
                },
                workspaceId,
                integrationId,
              );
              return;
            }
            // if (agentId) {
            //   this.chatMessageManagerService.updateChat({
            //     ...clientChat,
            //     agentId: agentId,
            //     status: ClientChatStatus.ASSIGNED,
            //   }, workspaceId);
            // }
            this.chatMessageManagerService.sendMessage(
              {
                ...baseEventMessage,
                event: ClientChatMessageEvent.CHATBOT_END,
              },
              workspaceId,
              integrationId,
            );
            this.ChatbotRunnerService.clearExecutor(clientChat.id);
          },
        });
        console.log('running flow');
        executor.runFlow(message.textBody ?? '');
      }
    } catch (error) {
      console.log('error', error);
      this.logger.error(error);
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
    workspaceId: string,
  ) {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsappIntegration',
        { shouldBypassPermissionChecks: true },
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

      const fileUrl = this.fileService.signFileUrl({
        url: (
          await this.fileMetadataService.createFile({
            file: mediaBuffer,
            filename: `${phoneNumber}_${v4()}`,
            mimeType: data.mime_type,
            workspaceId,
          })
        ).fullPath,
        workspaceId,
      });

      return fileUrl;
    } catch (error) {
      const err = `Error downloading media: ${error.message}`;

      throw new Error(err);
    }
  }
}
