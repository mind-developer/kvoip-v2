import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';

export type ChatMessageManagerSetAbandonedCronJobData = {
  chatId: string;
  workspaceId: string;
  clientChat: ClientChatWorkspaceEntity;
};
