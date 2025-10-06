import { ChatIntegrationSaveMessageInput } from 'src/engine/core-modules/chat-message-manager/types/integrationProviders';

export type SaveChatMessageJobData = {
  [K in keyof ChatIntegrationSaveMessageInput]: {
    chatType: K;
    saveMessageInput: ChatIntegrationSaveMessageInput[K];
    workspaceId: string;
  };
}[keyof ChatIntegrationSaveMessageInput];
