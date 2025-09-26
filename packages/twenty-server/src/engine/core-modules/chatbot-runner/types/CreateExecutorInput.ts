import {
  FlowNode,
  NodeHandler,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';

export type CreateExecutorInput = {
  integrationId: string;
  workspaceId: string;
  chatbotName: string;
  chatbot: Omit<
    ChatbotWorkspaceEntity,
    'workspace' | 'chatbotId' | 'viewport' | 'id'
  > & { workspace: { id: string } };
  sendTo: string;
  sectors: { id: string; name: string }[];
  onFinish: (finalNode: FlowNode, chosenInput?: string) => void;
};

export type ExecutorInput = CreateExecutorInput & {
  handlers: { [key: string]: NodeHandler };
};
