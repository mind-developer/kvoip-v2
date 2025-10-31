/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
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
import { useRecoilValue } from 'recoil';
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
  const node = useNodes().filter((filterNodes) => filterNodes.id === nodeId)[0];
  const { updateNodeData } = useReactFlow();
  const { saveDataValue } = useHandleNodeValue();

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

  const chatbotFlowSelectedNode = useRecoilValue(chatbotFlowSelectedNodeState);

  return (
    <BaseNode
      icon={'IconPhoto'}
      title={data.title ?? 'Node title'}
      nodeTypeDescription="Image node"
      onTitleChange={handleTitleChange}
      onTitleBlur={() => {
        saveDataValue('title', data.title, node);
      }}
      isSelected={selectedNode?.id === nodeId}
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
