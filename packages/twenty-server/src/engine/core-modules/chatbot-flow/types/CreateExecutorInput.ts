import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { NodeHandler } from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';
import { FlowNode } from 'typescript';

export type CreateExecutorInput = {
  integrationId: string;
  workspaceId: string;
  chatbotName: string;
  chatbotFlow: Omit<
    ChatbotFlow,
    'workspace' | 'chatbotId' | 'viewport' | 'id'
  > & { workspace: { id: string } };
  sendTo: string;
  personId: string;
  sectors: { id: string; name: string }[];
  onFinish: (finalNode: FlowNode, chosenInput?: string) => void;
};

export type ExecutorInput = CreateExecutorInput & {
  handlers: { [key: string]: NodeHandler };
};
