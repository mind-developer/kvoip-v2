import { ChatIntegrationSendMessageInput } from 'twenty-shared/types';

export type SendChatMessageQueueData = {
  [K in keyof ChatIntegrationSendMessageInput]: {
    chatType: K;
    sendMessageInput: ChatIntegrationSendMessageInput[K];
    workspaceId: string;
  };
}[keyof ChatIntegrationSendMessageInput];
