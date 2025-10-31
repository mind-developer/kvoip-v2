import { createNode } from '@/chatbot/utils/createNode';
import { type XYPosition, useReactFlow } from '@xyflow/react';
import { v4 } from 'uuid';
import { type GenericNode, type GenericNodeData } from '../types/GenericNode';

export const useHandleNodeValue = () => {
  const { updateNodeData, setNodes } = useReactFlow();

  const saveDataValue = (
    key: keyof GenericNodeData,
    value: any,
    node: GenericNode,
  ) => {
    const updatedData = { ...node.data, [key]: value };
    /* @kvoip-woulz proprietary:begin */
    // Sanitize outgoingNodeId to prevent self-referencing loops
    if ((updatedData as any).outgoingNodeId === node.id) {
      (updatedData as any).outgoingNodeId = '';
    }
    /* @kvoip-woulz proprietary:end */
    updateNodeData(node.id, updatedData);
  };

  const savePositionValue = (position: XYPosition, node: GenericNode) => {
    // Position is stored on the node itself, not in data
    // This function might not be needed, but keeping it for consistency
    const updatedData = { ...node.data };
    /* @kvoip-woulz proprietary:begin */
    // Sanitize outgoingNodeId to prevent self-referencing loops
    if ((updatedData as any).outgoingNodeId === node.id) {
      (updatedData as any).outgoingNodeId = '';
    }
    /* @kvoip-woulz proprietary:end */
    updateNodeData(node.id, updatedData);
  };

  const sanitizeNode = (node: GenericNode): GenericNode => {
    /* @kvoip-woulz proprietary:begin */
    // Sanitize outgoingNodeId to prevent self-referencing loops
    if ((node.data as any).outgoingNodeId === node.id) {
      return {
        ...node,
        data: { ...node.data, outgoingNodeId: '' } as any,
      };
    }
    /* @kvoip-woulz proprietary:end */
    return node;
  };

  /* @kvoip-woulz proprietary:begin */
  const addNode = (type: 'text' | 'image' | 'file' | 'conditional') => {
    setNodes((prevNodes) => {
      const isFirstNode = prevNodes.length === 0;
      const newNode = {
        ...createNode(type),
        id: v4(),
        data: {
          ...createNode(type).data,
          nodeStart: isFirstNode,
        },
      };
      return [...prevNodes, sanitizeNode(newNode)];
    });
  };
  /* @kvoip-woulz proprietary:end */

  return {
    saveDataValue,
    savePositionValue,
    addNode,
  };
};
