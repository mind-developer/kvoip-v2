import { Node, NodeTypes } from '@xyflow/react';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-flow/types/LogicNodeDataType';
import { SendWhatsAppMessageInput } from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';
import { SendMessageResponse } from 'src/engine/core-modules/meta/whatsapp/types/SendMessageResponse';

export type NodeHandler = {
  process(params: ProcessParams): Promise<string | null>;
};

export type ProcessParams = {
  integrationId: string;
  workspaceId: string;
  sendTo: string;
  personId: string;
  chatbotName: string;
  sectors: { id: string; name: string }[];
  onMessage: (
    response: SendMessageResponse | null,
    sentMessage: SendWhatsAppMessageInput,
  ) => void;
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
