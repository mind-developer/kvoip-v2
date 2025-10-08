import { Node, NodeTypes } from '@xyflow/react';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-runner/types/LogicNodeDataType';
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
  chatbotName: string;
  sectors: { id: string; name: string }[];
  node: FlowNode;
  context: { incomingMessage: string };
};

export type FlowNode = Omit<Node, 'data'> & {
  type: NodeTypes;
  data: Node['data'] & {
    text: string;
    logic?: NewConditionalState;
  };
};
