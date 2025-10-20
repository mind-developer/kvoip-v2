/* @kvoip-woulz proprietary */
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { ClientChatMessage } from 'twenty-shared/types';

type ProviderMessageId = string;

export interface ChatProviderDriver {
  sendMessage(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
    providerIntegrationId: string,
    clientChat: ClientChatWorkspaceEntity,
  ): Promise<ProviderMessageId>;
}
