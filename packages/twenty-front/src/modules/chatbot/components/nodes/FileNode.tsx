/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { StyledOption } from '@/chatbot/components/ui/StyledOption';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { GenericNode } from '@/chatbot/types/GenericNode';
import { renameFile } from '@/chatbot/utils/renameFile';
import styled from '@emotion/styled';
import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  useNodeConnections,
  useNodes,
  useReactFlow,
} from '@xyflow/react';
import { memo, useEffect } from 'react';
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
  const { handleIncomingConnection } = useHandleNodeValue();
  const allNodes = useNodes();
  const thisNode: GenericNode = allNodes.filter(
    (filterNodes) => filterNodes.id === id,
  )[0];
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
    /* @kvoip-woulz proprietary:begin */
    const currentNode = allNodes.find((n) => n.id === id);
    const currentNodeData = currentNode?.data || thisNode?.data || {};
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetConnections, sourceConnections, allNodes, id]);

  return (
    <BaseNode
      onTitleBlur={() => {}}
      onTitleChange={() => {}}
      icon={'IconFileImport'}
      nodeId={thisNode.id}
      nodeTypeDescription="File node"
      isInitialNode={thisNode.data.nodeStart as boolean}
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
      <ChatbotFlowFileEventForm selectedNode={thisNode} />
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
