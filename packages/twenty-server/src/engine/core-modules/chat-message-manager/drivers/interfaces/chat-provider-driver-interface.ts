import { ClientChatMessage } from 'twenty-shared/types';

type ProviderMessageId = string;

export interface ChatProviderDriver {
  sendMessage(
    clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>,
    workspaceId: string,
    providerIntegrationId: string,
  ): Promise<ProviderMessageId>;
}
