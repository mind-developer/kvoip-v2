import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { getMessageFields } from 'src/engine/core-modules/meta/whatsapp/utils/getMessageFields';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { ClientChatMessage } from 'twenty-shared/types';

@Injectable()
export class ChatMessageManagerService {
  META_API_URL: string;
  protected readonly logger = new Logger(ChatMessageManagerService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
  ) {
    this.META_API_URL = this.environmentService.get('META_API_URL');
  }

  async sendWhatsAppMessage(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    whatsappIntegrationId: string,
    workspaceId: string,
  ): Promise<{ id: string } | null> {
    const integration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      )
    ).findOne({ where: { id: whatsappIntegrationId } });

    if (!integration) {
      this.logger.error(
        '(sendWhatsAppMessage): Could not find WhatsApp integration:',
        whatsappIntegrationId,
      );
      throw new InternalServerErrorException('WhatsApp integration not found');
    }
    const metaUrl = `${this.META_API_URL}/${integration.phoneId}/messages`;
    const baileysUrl = `http://localhost:3002/api/session/${integration.name}/send`;

    const apiType = integration?.apiType || 'MetaAPI';
    this.logger.log('(sendWhatsAppMessage): API Type:', apiType);

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    const fields = getMessageFields(clientChatMessage);

    try {
      if (apiType === 'MetaAPI') {
        const response = await axios.post(metaUrl, fields, { headers });
        this.logger.log('(sendWhatsAppMessage): Sent message:', response.data);
        return response.data;
      }
      const response = await axios.post(baileysUrl, { fields });
      this.logger.log('(sendWhatsAppMessage): Sent message:', response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
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
    } catch (error) {
      this.logger.error(error);
    }
  }
}
