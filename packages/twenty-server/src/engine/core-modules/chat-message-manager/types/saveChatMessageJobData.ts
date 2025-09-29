import { ChatIntegrationSaveMessageInput } from 'twenty-shared/src/types/ChatIntegrationProvider';

export type SaveChatMessageJobData = {
  [K in keyof ChatIntegrationSaveMessageInput]: {
    chatType: K;
    saveMessageInput: ChatIntegrationSaveMessageInput[K];
    workspaceId: string;
  };
}[keyof ChatIntegrationSaveMessageInput];
