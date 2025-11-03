import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { type XYPosition, useReactFlow } from '@xyflow/react';
import { type GenericNode, type GenericNodeData } from '../types/GenericNode';

export const useHandleNodeValue = () => {
  const chatbotFlow = useGetChatbotFlowState();
  const { updateNodeData } = useReactFlow();

  const saveDataValue = (
    key: keyof GenericNodeData,
    value: any,
    node: GenericNode,
  ) => {
    if (!chatbotFlow) throw new Error(`Could not find flow state to update`);
    const updatedNodes = chatbotFlow.nodes.filter(
      (filterNode) => filterNode.id !== node.id,
    );
    updatedNodes.push({ ...node, data: { ...node.data, [key]: value } });
    updateNodeData(node.id, { ...node.data, [key]: value });
  };

  const savePositionValue = (position: XYPosition, node: GenericNode) => {
    if (!chatbotFlow)
      throw new Error(`Could not find flow state to update: ${chatbotFlow}`);
    const updatedNodes = chatbotFlow.nodes.filter(
      (filterNode) => filterNode.id !== node.id,
    );
    updatedNodes.push({ ...node, position });
    updateNodeData(node.id, { ...node.data, position });
  };

  return {
    saveDataValue,
    savePositionValue,
  };
};
