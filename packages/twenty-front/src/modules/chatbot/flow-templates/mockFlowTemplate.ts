import { type Edge } from '@xyflow/react';
import { type GenericNode } from '../types/GenericNode';
import { type ChatbotFlowData } from '../types/chatbotFlow.type';

export const initialNodes: GenericNode[] = [
  {
    id: '1',
    type: 'text',
    data: {
      title: 'Start',
      nodeStart: true,
      outgoingEdgeId: '',
    },
    selected: false,
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'conditional',
    data: {
      title: 'Conditional',
      logic: {
        logicNodes: [0],
        logicNodeData: [
          {
            option: '1',
            comparison: '==',
            sectorId: '',
            conditionValue: '||',
            outgoingEdgeId: 'b-1',
            outgoingNodeId: '3',
            recordType: 'text',
          },
        ],
      },
    },
    position: { x: 150, y: 150 },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'xy-edge__1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'xy-edge__2b-1-3',
    source: '2',
    target: '3',
    sourceHandle: 'b-1',
  },
];

export const initialFlow: Partial<ChatbotFlowData> = {
  nodes: initialNodes,
  edges: initialEdges,
};
