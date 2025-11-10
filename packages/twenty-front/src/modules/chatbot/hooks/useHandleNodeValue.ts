import { createNode } from '@/chatbot/utils/createNode';
import { useReactFlow } from '@xyflow/react';
import { v4 } from 'uuid';
import { type GenericNode, type GenericNodeData } from '../types/GenericNode';

export const useHandleNodeValue = () => {
  const { updateNodeData, setNodes, screenToFlowPosition } = useReactFlow();

  const saveDataValue = (
    key: keyof GenericNodeData,
    value: any,
    node: GenericNode,
  ) => {
    const updatedData = { ...node.data, [key]: value };
    // Sanitize outgoingNodeId to prevent self-referencing loops
    if ((updatedData as any).outgoingNodeId === node.id) {
      (updatedData as any).outgoingNodeId = '';
    }
    updateNodeData(node.id, updatedData);
  };

  const sanitizeNode = (node: GenericNode): GenericNode => {
    // Sanitize outgoingNodeId to prevent self-referencing loops
    if ((node.data as any).outgoingNodeId === node.id) {
      return {
        ...node,
        data: { ...node.data, outgoingNodeId: '' } as any,
      };
    }
    return node;
  };

  const addNode = (
    type: 'text' | 'image' | 'file' | 'conditional',
    cursorPosition?: { x: number; y: number },
  ) => {
    setNodes((prevNodes) => {
      // If there are no other nodes, the new node should be the start node
      console.log('addNode', prevNodes);
      const isFirstNode = prevNodes.length === 0;
      const baseNode = createNode(type);

      // Convert cursor position from screen coordinates to flow coordinates
      let position = baseNode.position;
      if (cursorPosition) {
        const flowPosition = screenToFlowPosition({
          x: cursorPosition.x,
          y: cursorPosition.y,
        });
        position = flowPosition;
      }

      const newNode = {
        ...baseNode,
        id: v4(),
        position,
        data: {
          ...baseNode.data,
          nodeStart: isFirstNode,
        },
      };
      
      return [...prevNodes, sanitizeNode(newNode)];
    });
  };

  return {
    saveDataValue,
    addNode,
  };
};
