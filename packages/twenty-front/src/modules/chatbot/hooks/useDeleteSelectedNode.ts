import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import {
  chatbotFlowEdges,
  chatbotFlowNodes,
} from '@/chatbot/state/chatbotFlowState';

import { useRecoilValue, useSetRecoilState } from 'recoil';

export const useDeleteSelectedNode = () => {
  const nodes = useRecoilValue(chatbotFlowNodes);
  const edges = useRecoilValue(chatbotFlowEdges);
  const setSelectedNode = useSetRecoilState(chatbotFlowSelectedNodeState);
  const setChatbotFlowNodes = useSetRecoilState(chatbotFlowNodes);
  const setChatbotFlowEdges = useSetRecoilState(chatbotFlowEdges);

  const deleteSelectedNode = (nodeId: string) => {
    if (!nodes || !edges || !nodeId) return;

    /* @kvoip-woulz proprietary:begin */
    const nodeToDelete = nodes.find((node) => node.id === nodeId);
    const isDeletingStartNode = nodeToDelete?.data?.nodeStart === true;
    /* @kvoip-woulz proprietary:end */

    const updatedNodes = nodes?.filter((node) => node.id !== nodeId);
    const updatedEdges = edges?.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );

    /* @kvoip-woulz proprietary:begin */
    // If deleting the start node and there are remaining nodes, set the first one as start
    if (isDeletingStartNode && updatedNodes && updatedNodes.length > 0) {
      const nextStartNode = updatedNodes[0];
      const nodesWithNewStart = updatedNodes.map((node) => {
        if (node.id === nextStartNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              nodeStart: true,
            },
          };
        }
        return {
          ...node,
          data: {
            ...node.data,
            nodeStart: false,
          },
        };
      });
      setChatbotFlowNodes(nodesWithNewStart);
    } else {
      setChatbotFlowNodes(updatedNodes ?? []);
    }
    /* @kvoip-woulz proprietary:end */

    setChatbotFlowEdges(updatedEdges ?? []);
    setSelectedNode((prev) => prev.filter((node) => node.id !== nodeId));
  };

  return { deleteSelectedNode };
};
