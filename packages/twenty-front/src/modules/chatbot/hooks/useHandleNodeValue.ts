import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { createNode } from '@/chatbot/utils/createNode';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useReactFlow } from '@xyflow/react';
import { v4 } from 'uuid';
import { type GenericNode, type GenericNodeData } from '../types/GenericNode';

export const useHandleNodeValue = () => {
  const {
    updateNodeData,
    setNodes,
    setEdges,
    screenToFlowPosition,
    getNodes,
    getEdges,
  } = useReactFlow();
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: 'chatbot',
  });
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();
  const { chatbotId } = useGetChatbotFlowState();

  const handleIncomingConnection = (
    currentNodeId: string,
    sourceNodeId: string,
    allNodes: GenericNode[],
  ) => {
    const currentNode = allNodes.find((n) => n.id === currentNodeId);
    const currentNodeData = currentNode?.data || {};

    // If the start node receives an incoming connection, set the previous node as the new start node
    const isCurrentNodeStart = currentNodeData.nodeStart === true;
    if (isCurrentNodeStart && sourceNodeId) {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            nodeStart: node.id === sourceNodeId,
          },
        })),
      );
    }
  };

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

  const deleteNode = (nodeId: string) => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const nodeToDelete = currentNodes.find((node) => node.id === nodeId);
    if (!nodeToDelete) return;

    const isDeletingStartNode = nodeToDelete.data?.nodeStart === true;
    const updatedNodes = currentNodes.filter((node) => node.id !== nodeId);
    const updatedEdges = currentEdges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );

    // If deleting the start node and there are remaining nodes, set a new start node
    if (isDeletingStartNode && updatedNodes.length > 0) {
      // Find the first node connected to the deleted start node
      const outgoingEdges = currentEdges.filter(
        (edge) => edge.source === nodeId,
      );
      let nextStartNode: (typeof updatedNodes)[0] | undefined;

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

      setNodes(nodesWithNewStart);
    } else {
      setNodes(updatedNodes);
    }

    setEdges(updatedEdges);
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
    handleIncomingConnection,
    deleteNode,
  };
};
