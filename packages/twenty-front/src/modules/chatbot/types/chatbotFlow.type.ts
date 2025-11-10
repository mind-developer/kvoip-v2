import { Edge } from '@xyflow/react';
import { GenericNode } from './GenericNode';

export type ChatbotFlowData = {
  nodes: GenericNode[];
  edges: Edge[];
  chatbotId: string;
  viewport?: { x: number; y: number; zoom: number };
};

export type ChatbotFlowInput = Omit<ChatbotFlowData, 'viewport'>;
