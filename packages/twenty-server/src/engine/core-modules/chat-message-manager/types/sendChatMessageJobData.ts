import { ChatIntegrationSendMessageInput } from 'src/engine/core-modules/chat-message-manager/types/integrationProviders';

export type SendChatMessageQueueData = {
  [K in keyof ChatIntegrationSendMessageInput]: {
    chatType: K;
    sendMessageInput: ChatIntegrationSendMessageInput[K];
    workspaceId: string;
  };
}[keyof ChatIntegrationSendMessageInput];
