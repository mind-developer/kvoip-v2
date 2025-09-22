import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import {
  SendWhatsAppMessageInput,
  SendWhatsAppTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';
import { SendWhatsAppMessageResponse } from 'src/engine/core-modules/meta/whatsapp/types/SendWhatsAppMessageResponse';
import { parseFields } from 'src/engine/core-modules/meta/whatsapp/utils/parseMessage';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WhatsappWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';

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
    input: SendWhatsAppMessageInput,
    workspaceId: string,
  ): Promise<SendWhatsAppMessageResponse | null> {
    this.logger.log('(sendWhatsAppMessage): Sending message:', input);
    const integration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      )
    ).findOne({ where: { id: input.integrationId } });

    if (!integration) {
      this.logger.log(
        '(sendWhatsAppMessage): Could not find WhatsApp integration:',
        integration,
      );
      throw new InternalServerErrorException('WhatsApp integration not found');
    }
    const metaUrl = `${this.META_API_URL}/${integration.phoneId}/messages`;
    const baileysUrl = `http://localhost:3002/api/session/${integration.name}/send`;

    const tipoApi = integration?.tipoApi || 'MetaAPI';
    this.logger.log('(sendWhatsAppMessage): API Type:', tipoApi);

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    const fields = parseFields(input);

    try {
      if (tipoApi === 'MetaAPI') {
        const response = await axios.post(metaUrl, fields, { headers });
        this.logger.log('(sendWhatsAppMessage): Sent:', response.data);
        return response.data;
      }
      const response = await axios.post(baileysUrl, { fields });
      this.logger.log('(sendWhatsAppMessage): Sent:', response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async sendWhatsAppTemplate(
    input: SendWhatsAppTemplateInput,
    workspaceId: string,
  ) {
    const integration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      )
    ).findOne({ where: { id: input.integrationId } });

    if (!integration) {
      throw new Error('WhatsApp integration not found');
    }

    const fields: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: input.to,
      type: 'template',
      template: {
        name: input.templateName,
        language: {
          code: input.language,
        },
      },
    };

    const url = `${this.META_API_URL}/${integration.phoneId}/messages`;
    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      await axios.post(url, fields, { headers });
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send template message',
        error.message,
      );
    }
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
      this.logger.error(error);
    }
  }
}
