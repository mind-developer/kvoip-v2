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

function TextNode({
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
>) {
  const nodeId = useNodeId();
  const node = useNodes().filter((filterNode) => filterNode.id === nodeId)[0];

  const { updateNodeData } = useReactFlow();
  const { saveDataValue } = useHandleNodeValue()

  const [titleValue, setTitleValue] = useState<string>(data.title)
  const [textValue, setTextValue] = useState<string>(data.title);
  let [hasHydratedInitialValues, setHasHydratedInitialValues] = useState(false);

  useEffect(() => {
    if (!data.title && !data.text) return
    if (!hasHydratedInitialValues) {
      setHasHydratedInitialValues(true)
      setTitleValue(data.title ?? "")
      setTextValue(data.text ?? "")
    }
  }, [data.title, data.text])

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


  return (
    <BaseNode
      icon={'IconTextSize'}
      title={titleValue}
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
          position={Position.Top}
          isConnectable={isConnectable}
          onDragEnd={(e) => console.log(e)}
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
          className="nodrag"
        />
      </>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable} />
    </BaseNode>
  );
}

export default memo(TextNode);
