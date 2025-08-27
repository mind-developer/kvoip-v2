/* eslint-disable @nx/workspace-component-props-naming */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { TextArea } from '@/ui/input/components/TextArea';
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
import { memo, useEffect, useState } from 'react';

const TextNode = ({
  id,
  data,
  isConnectable,
}: NodeProps<
  Node<{
    id: string;
    icon: string;
    title: string;
    text?: string;
    nodeStart: boolean;
  }>
>) => {
  const nodeId = useNodeId();
  const node = useNodes().filter((filterNode) => filterNode.id === nodeId)[0];

  const { updateNodeData } = useReactFlow();
  const { saveDataValue } = useHandleNodeValue();

  const [titleValue, setTitleValue] = useState<string>(data.title);
  const [textValue, setTextValue] = useState<string>(data.text ?? '');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetConnections, sourceConnections]);

  return (
    <BaseNode
      icon={'IconTextSize'}
      title={titleValue ?? 'Text node'}
      nodeStart={data.nodeStart}
      nodeTypeDescription="Text node"
      onTitleChange={(e) => setTitleValue(e)}
      onTitleBlur={() => {
        saveDataValue('title', titleValue, node);
      }}
    >
      {!data.nodeStart && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
        />
      )}
      <>
        <TextArea
          label="Message body"
          placeholder="Text message to be sent"
          value={textValue}
          onChange={(e) => setTextValue(e)}
          onBlur={() => {
            saveDataValue('text', textValue, node);
          }}
        />
      </>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
};

export default memo(TextNode);
