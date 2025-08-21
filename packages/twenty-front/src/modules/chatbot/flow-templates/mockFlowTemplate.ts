import { Edge } from '@xyflow/react';
import { GenericNode } from '../types/GenericNode';

export const initialNodes: GenericNode[] = [
  {
    id: '1',
    type: 'text',
    data: {
      nodeStart: true,
      title: 'Mensagem Inicial',
      outgoingEdgeId: '',
    },
    selected: false,
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'condition',
    data: {
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
  {
    id: '3',
    type: 'text',
    data: { nodeStart: false, title: 'Mensagem' },
    position: { x: 500, y: 300 },
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
