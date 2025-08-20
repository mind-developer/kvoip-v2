/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { StyledLabel } from '@/chatbot/components/ui/StyledLabel';
import { StyledOption } from '@/chatbot/components/ui/StyledOption';
import {
  Handle,
  Node,
  NodeProps,
  Position,
  useNodeConnections,
  useReactFlow,
} from '@xyflow/react';
import { memo, useEffect, useRef } from 'react';

function TextNode({
  id,
  data,
  isConnectable,
}: NodeProps<
  Node<{
    icon: string;
    title: string;
    text?: string;
    nodeStart: boolean;
  }>
>) {
  const { updateNodeData } = useReactFlow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

      if (data.nodeStart) {
        updateNodeData(id, {
          ...data,
          outgoingNodeId: nodeId || '2',
        });
      } else {
        updateNodeData(id, {
          ...data,
          outgoingEdgeId: sourceHandle,
          outgoingNodeId: nodeId,
        });
      }
    }
  }, [targetConnections, sourceConnections]);

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (textareaRef.current) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.text]);

  return (
    <BaseNode
      icon={'IconTextSize'}
      title={data.title ?? 'Node title'}
      nodeStart={data.nodeStart}
    >
      {!data.nodeStart && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}
      <StyledLabel>Message body</StyledLabel>
      <StyledOption icon="IconTextPlus">
        {data.text ?? 'Insert text to be sent'}
      </StyledOption>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
}

export default memo(TextNode);
