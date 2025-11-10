import {
  FlowNode,
  NodeHandler,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { ChatIntegrationProvider } from 'twenty-shared/types';

export type CreateExecutorInput = {
  provider: ChatIntegrationProvider;
  providerIntegrationId: string;
  clientChat: ClientChatWorkspaceEntity;
  workspaceId: string;
  chatbotName: string;
  chatbot: Omit<
    ChatbotWorkspaceEntity,
    'workspace' | 'chatbotId' | 'viewport' | 'id'
  > & { workspace: { id: string } };
  sectors: { id: string; name: string }[];
  onFinish: (finalNode: FlowNode, chosenInput?: string) => void;
};

export type ExecutorInput = CreateExecutorInput & {
  handlers: { [key: string]: NodeHandler };
  clearExecutor: () => void;
};
