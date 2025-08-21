/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { GenericNode } from '@/chatbot/types/GenericNode';
import { ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
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
import { useRecoilState } from 'recoil';

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
  const { updateNodeData } = useReactFlow();
  const nodeId = useNodeId();
  const node = useNodes().filter((filterNode) => filterNode.id === nodeId)[0];

  const { updateFlow } = useUpdateChatbotFlow();
  const chatbotFlow = useRecoilState(chatbotFlowState)[0];

  //possibly move to useRecoil
  const [titleValue, setTitleValue] = useState(data.title ?? '');
  const [textValue, setTextValue] = useState(data.text ?? '');

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

  const handleKeyUpdate = (key: string, e: string, node: GenericNode) => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (chatbotFlow?.chatbotId) {
      const flow = {
        edges: [...chatbotFlow.edges],
        nodes: [
          ...chatbotFlow.nodes,
          { ...node, data: { ...node.data, [key]: e } },
        ],
        chatbotId: chatbotFlow.chatbotId,
        viewport: chatbotFlow.viewport,
      };
      updateFlow(flow as ChatbotFlowData);
    }
    updateNodeData(id, {
      ...node.data,
      [key]: e,
    });
  };

  return (
    <BaseNode
      icon={'IconTextSize'}
      title={titleValue ?? 'Node title'}
      nodeStart={data.nodeStart}
      nodeTypeDescription="Message node"
      onTitleChange={(e) => setTitleValue(e)}
      onTitleBlur={() => {
        handleKeyUpdate('text', titleValue, node);
      }}
    >
      {!data.nodeStart && (
        <Handle
          type="target"
          position={Position.Top}
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
            handleKeyUpdate('text', textValue, node);
          }}
        />
      </>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
}

export default memo(TextNode);
