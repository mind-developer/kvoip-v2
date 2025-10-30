import { ClientChatMessage } from 'twenty-shared/types';

export type SendChatMessageQueueData = {
  clientChatMessage: Omit<ClientChatMessage, 'providerMessageId'>;
  providerIntegrationId: string;
  workspaceId: string;
};
