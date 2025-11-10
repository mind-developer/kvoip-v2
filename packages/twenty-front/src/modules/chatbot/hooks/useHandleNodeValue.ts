import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { XYPosition, useReactFlow } from '@xyflow/react';
import { GenericNode, GenericNodeData } from '../types/GenericNode';
import { useSaveChatbotFlowState } from './useSaveChatbotFlowState';

export const useHandleNodeValue = () => {
  const chatbotFlow = useGetChatbotFlowState();
  const saveChatbotFlow = useSaveChatbotFlowState();
  const { updateNodeData } = useReactFlow();

  const saveDataValue = (
    key: keyof GenericNodeData,
    value: any,
    node: GenericNode,
  ) => {
    if (!chatbotFlow) throw new Error(`Could not find flow state to update`);
    const newFlow = {
      nodes: [
        ...chatbotFlow.nodes.filter((filterNode) => filterNode.id !== node.id),
        { ...node, data: { ...node.data, [key]: value } },
      ],
      edges: [...chatbotFlow.edges],
      chatbotId: chatbotFlow.chatbotId,
    };
    updateNodeData(node.id, { ...node.data, [key]: value });
    saveChatbotFlow(newFlow);
  };

  const savePositionValue = (position: XYPosition, node: GenericNode) => {
    if (!chatbotFlow)
      throw new Error(`Could not find flow state to update: ${chatbotFlow}`);
    const newFlow = {
      nodes: [
        ...chatbotFlow.nodes.filter((filterNode) => filterNode.id !== node.id),
        { ...node, position },
      ],
      edges: [...chatbotFlow.edges],
      chatbotId: chatbotFlow.chatbotId,
    };
    updateNodeData(node.id, { ...node.data, position });
    saveChatbotFlow(newFlow);
  };

  return {
    saveDataValue,
    savePositionValue,
  };
};
