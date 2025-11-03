/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { StyledOption } from '@/chatbot/components/ui/StyledOption';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { renameFile } from '@/chatbot/utils/renameFile';
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
import { useIcons } from 'twenty-ui/display';
import { ChatbotFlowFileEventForm } from '../actions/ChatbotFlowFileEventForm';

const StyledIcon = styled.div`
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.accent.accent3570};
  padding: 1px 1px;
  border-radius: 2px;
  display: flex;
  width: 14px;
  height: 14px;
`;

function FileNode({
  id,
  data,
  isConnectable,
}: NodeProps<
  Node<{
    icon: string;
    title: string;
    fileUrl?: string;
  }>
>) {
  const { updateNodeData } = useReactFlow();
  const nodeId = useNodeId();
  const node = useNodes().filter((filterNodes) => filterNodes.id === nodeId)[0];
  const { getIcon } = useIcons();
  const IconFileText = getIcon('IconFileText');

  const targetConnections = useNodeConnections({
    id,
    handleType: 'target',
  });

  const sourceConnections = useNodeConnections({
    id,
    handleType: 'source',
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetConnections, sourceConnections]);

  const chatbotFlowSelectedNode = useRecoilValue(chatbotFlowSelectedNodeState);

  return (
    <BaseNode
      onTitleBlur={() => {}}
      onTitleChange={() => {}}
      icon={'IconFileImport'}
      title={data.title ?? 'Node title'}
      nodeTypeDescription="File node"
      isSelected={selectedNode?.id === nodeId}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ height: 10, width: 10 }}
      />
      {data.fileUrl && (
        <StyledOption>
          <StyledIcon>
            <IconFileText color={'red'} />
          </StyledIcon>
          {renameFile(data.fileUrl)}
        </StyledOption>
      )}
      <ChatbotFlowFileEventForm selectedNode={node} />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ height: 10, width: 10 }}
      />
    </BaseNode>
  );
}

export default memo(FileNode);
