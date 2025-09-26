import { Node, NodeTypes } from '@xyflow/react';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-runner/types/LogicNodeDataType';

export type NodeHandler = {
  process(params: ProcessParams): Promise<string | null>;
};

export type ProcessParams = {
  integrationId: string;
  workspaceId: string;
  sendTo: string;
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
