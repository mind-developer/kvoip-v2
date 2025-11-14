import { NodeHandler } from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { ChatIntegrationProvider } from 'twenty-shared/types';

export type CreateExecutorInput = {
  workspaceId: string;
  provider: ChatIntegrationProvider;
  providerIntegrationId: string;
  clientChat: ClientChatWorkspaceEntity;
  chatbot: ChatbotWorkspaceEntity;
  onFinish: () => void;
};

export type ExecutorInput = CreateExecutorInput & {
  handlers: { [key: string]: NodeHandler };
  clearExecutor: () => void;
};
