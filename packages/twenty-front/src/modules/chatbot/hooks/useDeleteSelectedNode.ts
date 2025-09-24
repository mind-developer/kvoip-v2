import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { useSaveChatbotFlowState } from '@/chatbot/hooks/useSaveChatbotFlowState';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { useSetRecoilState } from 'recoil';

export const useDeleteSelectedNode = () => {
  const chatbotFlow = useGetChatbotFlowState();
  const saveChatbotFlowState = useSaveChatbotFlowState();
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
    saveChatbotFlowState(updatedChatbotFlow);
  };

  return { deleteSelectedNode };
};
