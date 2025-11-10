/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import styled from '@emotion/styled';
import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  useNodeConnections,
  useNodeId,
  useNodes,
  useReactFlow,
} from '@xyflow/react';
import { memo, useEffect } from 'react';
import { ChatbotFlowImageEventForm } from '../actions/ChatbotFlowImageEventForm';

const StyledDiv = styled.div`
  display: flex;
  width: 100%;
`;

const StyledImage = styled.img`
  align-items: end;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  object-fit: cover;
  max-width: 270px;
  width: 100%;
`;

function ImageNode({
  id,
  data,
  isConnectable,
}: NodeProps<
  Node<{
    icon: string;
    title: string;
    imageUrl?: string;
  }>
>) {
  const nodeId = useNodeId();
  const allNodes = useNodes();
  const node = allNodes.filter((filterNodes) => filterNodes.id === nodeId)[0];
  const { updateNodeData } = useReactFlow();
  const { saveDataValue, handleIncomingConnection } = useHandleNodeValue();

  const targetConnections = useNodeConnections({
    id,
    handleType: 'target',
  });

  const sourceConnections = useNodeConnections({
    id,
    handleType: 'source',
  });

  const handleTitleChange = (e: string) => {
    updateNodeData(id, {
      ...data,
      title: e,
    });
  };

  useEffect(() => {
    /* @kvoip-woulz proprietary:begin */
    const currentNode = allNodes.find((n) => n.id === id);
    const currentNodeData = currentNode?.data || data;
    /* @kvoip-woulz proprietary:end */

    if (targetConnections.length > 0) {
      const connection = targetConnections[0];
      const sourceHandle = connection.sourceHandle || '';
      const sourceNodeId = connection.source;

      /* @kvoip-woulz proprietary:begin */
      const sourceNode = allNodes.find((n) => n.id === sourceNodeId);
      const sourceNodeData = sourceNode?.data || {};

      // If the start node receives an incoming connection, set the previous node as the new start node
      handleIncomingConnection(id, sourceNodeId, allNodes);
      /* @kvoip-woulz proprietary:end */

      // Update current node with incoming connection info
      updateNodeData(id, {
        ...currentNodeData,
        incomingEdgeId: sourceHandle,
        incomingNodeId: sourceNodeId,
      });

      // Update source node with outgoing connection info
      updateNodeData(sourceNodeId!, {
        ...sourceNodeData,
        outgoingEdgeId: sourceHandle,
        outgoingNodeId: id,
      });
    }

    if (sourceConnections.length > 0) {
      const connection = sourceConnections[0];
      const sourceHandle = connection.sourceHandle;
      const targetNodeId = connection.target;

      /* @kvoip-woulz proprietary:begin */
      const targetNode = allNodes.find((n) => n.id === targetNodeId);
      const targetNodeData = targetNode?.data || {};
      /* @kvoip-woulz proprietary:end */

      // Update current node with outgoing connection info
      updateNodeData(id, {
        ...currentNodeData,
        outgoingEdgeId: sourceHandle,
        outgoingNodeId: targetNodeId,
      });

      // Update target node with incoming connection info
      updateNodeData(targetNodeId!, {
        ...targetNodeData,
        incomingEdgeId: sourceHandle,
        incomingNodeId: id,
      });
    }
  }, [targetConnections, sourceConnections, allNodes, id]);

  return (
    <BaseNode
      icon={'IconPhoto'}
      nodeId={node?.id}
      isInitialNode={node?.data.nodeStart as boolean}
      nodeTypeDescription="Image node"
      onTitleChange={handleTitleChange}
      onTitleBlur={() => {
        saveDataValue('title', data.title, node);
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ height: 10, width: 10 }}
      />
      {data.imageUrl && (
        <StyledDiv>
          <StyledImage src={data.imageUrl} />
        </StyledDiv>
      )}
      <ChatbotFlowImageEventForm selectedNode={node} />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ height: 10, width: 10 }}
      />
    </BaseNode>
  );
}

export default memo(ImageNode);
