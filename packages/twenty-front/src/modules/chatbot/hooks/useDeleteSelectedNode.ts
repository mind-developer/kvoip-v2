/* @kvoip-woulz proprietary */
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

    const nodeToDelete = nodes.find((node) => node.id === nodeId);
    const isDeletingStartNode = nodeToDelete?.data?.nodeStart === true;

    const updatedNodes = nodes?.filter((node) => node.id !== nodeId);
    const updatedEdges = edges?.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );

    if (isDeletingStartNode && updatedNodes && updatedNodes.length > 0) {
      // Find the first node connected to the deleted start node
      const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
      let nextStartNode: typeof updatedNodes[0] | undefined;
      
      if (outgoingEdges.length > 0) {
        const firstConnectedNodeId = outgoingEdges[0].target;
        nextStartNode = updatedNodes.find(
          (node) => node.id === firstConnectedNodeId,
        );
      }
      
      // Use the first connected node if found, otherwise use the first node in the array
      const newStartNode = nextStartNode ?? updatedNodes[0];
      
      const nodesWithNewStart = updatedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          nodeStart: node.id === newStartNode.id,
        },
      }));
      
      setChatbotFlowNodes(nodesWithNewStart);
    } else {
      setChatbotFlowNodes(updatedNodes ?? []);
    }

    setChatbotFlowEdges(updatedEdges ?? []);
    setSelectedNode((prev) => prev.filter((node) => node.id !== nodeId));
  };

  return { deleteSelectedNode };
};
