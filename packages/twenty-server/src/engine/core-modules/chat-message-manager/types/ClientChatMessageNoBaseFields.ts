import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';

export type ClientChatMessageNoBaseFields = Omit<
  ClientChatMessageWorkspaceEntity,
  'createdAt' | 'updatedAt' | 'deletedAt' | 'id' | 'clientChat'
>;
