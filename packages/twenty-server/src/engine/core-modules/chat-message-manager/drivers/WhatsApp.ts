import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { ChatProviderDriver } from 'src/engine/core-modules/chat-message-manager/drivers/interfaces/chat-provider-driver-interface';
import { getMessageFields } from 'src/engine/core-modules/meta/whatsapp/utils/getMessageFields';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { ClientChatMessage } from 'twenty-shared/types';

export class WhatsAppDriver implements ChatProviderDriver {
  private readonly META_API_URL: string;

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
  ) {
    this.META_API_URL = this.environmentService.get('META_API_URL');
  }

  async sendMessage(
    clientChatMessage: ClientChatMessage,
    workspaceId: string,
    providerIntegrationId: string,
  ) {
    const integration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsappIntegration',
      )
    ).findOne({ where: { id: providerIntegrationId } });

    if (!integration) {
      throw new InternalServerErrorException('WhatsApp integration not found');
    }
    const metaUrl = `${this.META_API_URL}/${integration.phoneId}/messages`;
    const baileysUrl = `http://localhost:3002/api/session/${integration.name}/send`;

    const apiType = integration?.apiType || 'MetaAPI';

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    const fields = getMessageFields(clientChatMessage);

    try {
      if (apiType === 'MetaAPI') {
        const response = await axios.post(metaUrl, fields, { headers });
        return response.data.messages.id;
      }
      const response = await axios.post(baileysUrl, { fields });
      return response.data.messages.id;
    } catch (error) {
      throw new InternalServerErrorException('Failed to send message');
    }
  }
}
