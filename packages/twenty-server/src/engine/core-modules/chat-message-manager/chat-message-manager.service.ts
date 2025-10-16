/* @kvoip-woulz proprietary */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChatProviderDriver } from 'src/engine/core-modules/chat-message-manager/drivers/interfaces/chat-provider-driver-interface';
import { WhatsAppDriver } from 'src/engine/core-modules/chat-message-manager/drivers/WhatsApp';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import {
  ChatIntegrationProvider,
  ClientChatMessage,
} from 'twenty-shared/types';

@Injectable()
export class ChatMessageManagerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
  ) {}

  async sendMessage(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
    providerIntegrationId: string,
  ) {
    const providerDriver = this.getProviderDriver(clientChatMessage.provider);
    return providerDriver.sendMessage(
      clientChatMessage,
      workspaceId,
      providerIntegrationId,
    );
  }

  async saveMessage(clientChatMessage: ClientChatMessage, workspaceId: string) {
    const message = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
        workspaceId,
        'clientChatMessage',
      )
    ).save(clientChatMessage);
    return message;
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
