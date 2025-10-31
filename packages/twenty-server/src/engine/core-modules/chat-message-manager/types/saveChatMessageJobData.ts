import { ClientChatMessage } from 'twenty-shared/types';

export type SaveClientChatMessageJobData = {
  chatMessage: ClientChatMessage;
  workspaceId: string;
};
