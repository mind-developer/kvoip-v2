import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import {
  SendMessageInput,
  SendTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-message.input';
import { SendMessageResponse } from 'src/engine/core-modules/meta/whatsapp/types/SendMessageResponse';
import { parseFields } from 'src/engine/core-modules/meta/whatsapp/utils/parseMessage';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WhatsappWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';

@Injectable()
export class MessageManagerService {
  META_API_URL: string;

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
  ) {
    this.META_API_URL = this.environmentService.get('META_API_URL');
  }

  async sendWhatsAppMessage(
    input: SendMessageInput,
    workspaceId: string,
  ): Promise<SendMessageResponse | null> {
    const integration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      )
    ).findOne({ where: { id: input.integrationId } });

    if (!integration) {
      throw new InternalServerErrorException('WhatsApp integration not found');
    }
    const metaUrl = `${this.META_API_URL}/${integration.phoneId}/messages`;
    const baileysUrl = `http://localhost:3002/api/session/${integration.name}/send`;

    const tipoApi = integration?.tipoApi || 'MetaAPI';

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    const fields = parseFields(input);

    if (tipoApi === 'MetaAPI') {
      const response = await axios.post(metaUrl, fields, { headers });
      return response.data;
    }
    const response = await axios.post(baileysUrl, { fields });
    return response.data;
  }

  async sendWhatsAppTemplate(input: SendTemplateInput, workspaceId: string) {
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
      throw new InternalServerErrorException(error);
    }
  }
}
