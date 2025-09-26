import { ChatIntegrationSendMessageInput } from 'twenty-shared/src/types/ChatIntegrationProviders';

export type SendChatMessageQueueData = {
  [K in keyof ChatIntegrationSendMessageInput]: {
    chatType: K;
    sendMessageInput: ChatIntegrationSendMessageInput[K];
    workspaceId: string;
  };
}[keyof ChatIntegrationSendMessageInput];
