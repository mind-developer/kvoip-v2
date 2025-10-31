/* eslint-disable @nx/workspace-component-props-naming */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { GenericNode } from '@/chatbot/types/GenericNode';
import { TextArea } from '@/ui/input/components/TextArea';
import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  useNodeConnections,
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
  const allNodes = useNodes();
  const node: GenericNode = allNodes.filter(
    (filterNode) => filterNode.id === id,
  )[0];

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
    const currentNode = allNodes.find((n) => n.id === id);
    const currentNodeData = currentNode?.data || data;

    if (targetConnections.length > 0) {
      const connection = targetConnections[0];
      const sourceHandle = connection.sourceHandle || '';
      const sourceNodeId = connection.source;

      const sourceNode = allNodes.find((n) => n.id === sourceNodeId);
      const sourceNodeData = sourceNode?.data || {};

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

      const targetNode = allNodes.find((n) => n.id === targetNodeId);
      const targetNodeData = targetNode?.data || {};

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
  }, [targetConnections, sourceConnections, allNodes, id, data.nodeStart]);

  return (
    <BaseNode
      icon={'IconTextSize'}
      nodeId={node.id}
      isInitialNode={node?.data.nodeStart as boolean}
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
          style={{ height: 10, width: 10 }}
        />
      )}
      <>
        <TextArea
          textAreaId="text-node-text-area"
          label="Message body"
          placeholder="Text message to be sent"
          value={textValue}
          onChange={(e) => setTextValue(e)}
          onBlur={() => {
            saveDataValue('text', textValue, node);
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ height: 10, width: 10 }}
        />
      </>
    </BaseNode>
  );
};

export default memo(TextNode);
