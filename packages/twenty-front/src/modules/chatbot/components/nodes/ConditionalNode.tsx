/* @kvoip-woulz proprietary */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { GenericNode, type GenericNodeData } from '@/chatbot/types/GenericNode';
import { type NewConditionalState } from '@/chatbot/types/LogicNodeDataType';
import styled from '@emotion/styled';
import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  useNodeConnections,
  useNodes,
  useReactFlow,
  useUpdateNodeInternals,
} from '@xyflow/react';
import { memo, useEffect, useState } from 'react';
import { ChatbotFlowConditionalEventForm } from '../actions/ChatbotFlowConditionalEventForm';

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  gap: 12px;
  overflow-x: visible;
  position: relative;
`;

const StyledLogicNodeWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  position: relative;
  overflow-x: visible;
`;

function ConditionalNode({
  id,
  data,
  isConnectable,
}: NodeProps<Node<GenericNodeData>>) {
  const [titleInput, setTitleInput] = useState(data.title ?? '');

  const allNodes = useNodes();
  const thisNode = allNodes.find((node) => node.id === id) as GenericNode;

  const { updateNodeData } = useReactFlow();
  const { handleIncomingConnection } = useHandleNodeValue();
  const updateNodeInternals = useUpdateNodeInternals();

  const targetConnections = useNodeConnections({
    id,
    handleType: 'target',
  });

  const sourceConnections = useNodeConnections({
    id,
    handleType: 'source',
  });

  const baseLogic = data.logic as NewConditionalState | undefined;
  const logicNodeDataLength = baseLogic?.logicNodeData.length ?? 0;

  useEffect(() => {
    const currentNode = allNodes.find((n) => n.id === id);
    const currentNodeData = currentNode?.data || data;

    if (targetConnections.length > 0) {
      const connection = targetConnections[0];
      const sourceHandle = connection.sourceHandle || '';
      const sourceNodeId = connection.source;

      const sourceNode = allNodes.find((n) => n.id === sourceNodeId);
      const sourceNodeData = sourceNode?.data || {};

      handleIncomingConnection(id, sourceNodeId, allNodes);

      updateNodeData(id, {
        ...currentNodeData,
        incomingEdgeId: sourceHandle,
        incomingNodeId: sourceNodeId,
      });

      updateNodeData(sourceNodeId, {
        ...sourceNodeData,
        outgoingEdgeId: sourceHandle,
        outgoingNodeId: id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetConnections, allNodes, id]);

  useEffect(() => {
    const baseLogic = data.logic as NewConditionalState | undefined;
    if (!baseLogic?.logicNodeData.length) return;

    const updatedLogic: NewConditionalState = {
      logicNodes: [...baseLogic.logicNodes],
      logicNodeData: baseLogic.logicNodeData.map((nodeData) => {
        const handleId = `b-${nodeData.option}`;
        const conn = sourceConnections.find((c) => c.sourceHandle === handleId);

        return {
          ...nodeData,
          outgoingEdgeId: conn?.sourceHandle || '',
          outgoingNodeId: conn?.target || '',
        };
      }),
    };

    const currentNode = allNodes.find((n) => n.id === id);
    if (!currentNode) return;

    updateNodeData(id, {
      ...currentNode.data,
      logic: updatedLogic,
    });
  }, [sourceConnections, id]);

  useEffect(() => {
    const baseLogic = data.logic as NewConditionalState | undefined;
    if (baseLogic?.logicNodeData.length) {
      updateNodeInternals(id);
    }
  }, [data.logic]);

  if (!thisNode) return null;

  return (
    <BaseNode
      icon={'IconHierarchy'}
      isInitialNode={thisNode.data.nodeStart as boolean}
      nodeId={thisNode.id}
      nodeTypeDescription="If/else node"
      onTitleChange={setTitleInput}
      onTitleBlur={() => {
        updateNodeData(thisNode.id, {
          ...thisNode.data,
          title: titleInput || 'Conditional Node',
        });
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ height: 10, width: 10 }}
      />
      <StyledDiv>
        <StyledLogicNodeWrapper>
          <ChatbotFlowConditionalEventForm
            selectedNode={thisNode}
            isConnectable={isConnectable}
          />
        </StyledLogicNodeWrapper>
      </StyledDiv>
    </BaseNode>
  );
}

export default memo(ConditionalNode);
