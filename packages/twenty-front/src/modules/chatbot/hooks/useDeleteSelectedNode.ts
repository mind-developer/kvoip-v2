import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';

import { useRecoilValue, useSetRecoilState } from 'recoil';

export const useDeleteSelectedNode = () => {
  const chatbotFlowNodes = useRecoilValue(chatbotFlowNodes);
  const chatbotFlowEdges = useRecoilValue(chatbotFlowEdges);
  const setSelectedNode = useSetRecoilState(chatbotFlowSelectedNodeState);
  const setChatbotFlowNodes = useSetRecoilState(chatbotFlowNodes);
  const setChatbotFlowEdges = useSetRecoilState(chatbotFlowEdges);

  const deleteSelectedNode = (nodeId: string) => {
    if (!nodes || !edges || !nodeId) return;

    const updatedNodes = nodes?.filter((node) => node.id !== nodeId);
    const updatedEdges = edges?.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );

    setChatbotFlowNodes(updatedNodes ?? []);
    setChatbotFlowEdges(updatedEdges ?? []);
    setSelectedNode(undefined);
  };

  return { deleteSelectedNode };
};
