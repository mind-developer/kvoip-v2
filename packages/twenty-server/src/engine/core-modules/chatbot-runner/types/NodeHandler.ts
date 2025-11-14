import { Node, NodeTypes } from '@xyflow/react';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-runner/types/LogicNodeDataType';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { ChatIntegrationProvider } from 'twenty-shared/types';

export type NodeHandler = {
  process(params: ProcessParams): Promise<string | null>;
};

export type ProcessParams = {
  clientChat: ClientChatWorkspaceEntity;
  workspaceId: string;
  provider: ChatIntegrationProvider;
  providerIntegrationId: string;
  chatbot: ChatbotWorkspaceEntity;
  node: FlowNode;
  context: { incomingMessage: string };
  askedNodes?: Set<string>; // Estado compartilhado por executor (chat)
};

export type FlowNode = Omit<Node, 'data'> & {
  type: NodeTypes;
  data: Node['data'] & {
    text: string;
    logic?: NewConditionalState;
  };
};
