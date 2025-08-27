import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useUpdateChatbotFlow } from './useUpdateChatbotFlow';

export const useDeleteSelectedNode = () => {
  const [chatbotFlow] = useRecoilState(chatbotFlowState);
  const { updateFlow } = useUpdateChatbotFlow();
  const setSelectedNode = useSetRecoilState(chatbotFlowSelectedNodeState);

  const deleteSelectedNode = (nodeId: string) => {
    if (!chatbotFlow || !nodeId) return;

    const updatedNodes = chatbotFlow.nodes?.filter(
      (node) => node.id !== nodeId,
    );
    const updatedEdges = chatbotFlow.edges?.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );

    const updatedChatbotFlow = {
      chatbotId: chatbotFlow.chatbotId,
      nodes: updatedNodes,
      edges: updatedEdges,
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    setSelectedNode(undefined);
    updateFlow(updatedChatbotFlow);
  };

  return { deleteSelectedNode };
};
