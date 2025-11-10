import { type Edge } from '@xyflow/react';
import { type ChatbotStatus } from '~/generated/graphql';
import { type GenericNode } from './GenericNode';

export type ChatbotFlowData = {
  id?: string;
  nodes: GenericNode[];
  edges: Edge[];
  chatbotId: string;
  viewport?: { x: number; y: number; zoom: number };
  status?: ChatbotStatus;
};

export type ChatbotFlowInput = Omit<ChatbotFlowData, 'viewport'>;
