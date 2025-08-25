/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import styled from '@emotion/styled';
import {
  Handle,
  Node,
  NodeProps,
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
  const nodeId = useNodeId()
  const node = useNodes().filter(filterNodes => filterNodes.id === nodeId)[0]
  const { updateNodeData } = useReactFlow();

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
    if (targetConnections.length > 0) {
      const connection = targetConnections[0];
      const sourceHandle = connection.sourceHandle || '';
      const nodeId = connection.source;

      updateNodeData(id, {
        ...data,
        incomingEdgeId: sourceHandle,
        incomingNodeId: nodeId,
      });
    }

    if (sourceConnections.length > 0) {
      const connection = sourceConnections[0];
      const sourceHandle = connection.sourceHandle;
      const nodeId = connection.target;

      updateNodeData(id, {
        ...data,
        outgoingEdgeId: sourceHandle,
        outgoingNodeId: nodeId,
      });
    }
  }, [targetConnections, sourceConnections]);

  return (
    <BaseNode
      icon={'IconPhoto'}
      title={data.title ?? 'Node title'}
      nodeTypeDescription="Image node"
      onTitleChange={handleTitleChange}
      onTitleBlur={() => { }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
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
      />
    </BaseNode>
  );
}

export default memo(ImageNode);
