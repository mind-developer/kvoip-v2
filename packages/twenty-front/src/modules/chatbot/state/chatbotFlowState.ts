import {
  initialEdges,
  initialNodes,
} from '@/chatbot/flow-templates/mockFlowTemplate';
import { type GenericNode } from '@/chatbot/types/GenericNode';
import { type Edge, type XYPosition } from '@xyflow/react';
import { createState } from 'twenty-ui/utilities';

export const chatbotFlowNodes = createState<GenericNode[]>({
  key: 'chatbotFlowNodes',
  defaultValue: initialNodes,
});

export const chatbotFlowEdges = createState<Edge[]>({
  key: 'chatbotFlowEdges',
  defaultValue: initialEdges,
});

export const chatbotFlowViewport = createState<
  (XYPosition & { zoom: number }) | undefined
>({
  key: 'chatbotFlowViewport',
  defaultValue: undefined,
});

export const chatbotFlowChatbotId = createState<string>({
  key: 'chatbotId',
  defaultValue: '',
});
