/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable react-hooks/exhaustive-deps */
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
  useNodeId,
  useNodes,
  useReactFlow,
} from '@xyflow/react';
import { memo, useEffect, useState } from 'react';
import { ChatbotFlowConditionalEventForm } from '../actions/ChatbotFlowConditionalEventForm';

const initialState: NewConditionalState = {
  logicNodes: [],
  logicNodeData: [],
};

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  gap: 12px;
`;

const StyledLogicNodeWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  position: relative;
`;

function ConditionalNode({
  id,
  data,
  isConnectable,
}: NodeProps<Node<GenericNodeData>>) {
  const [logicState, setLogicState] =
    useState<NewConditionalState>(initialState);
  const [titleInput, setTitleInput] = useState(data.title ?? '');

  const thisNodeId = useNodeId();
  const allNodes = useNodes();
  const thisNode: GenericNode = allNodes.filter(
    (node) => node.id === thisNodeId,
  )[0];

  const { updateNodeData } = useReactFlow();
  const { saveDataValue, handleIncomingConnection } = useHandleNodeValue();

  const targetConnections = useNodeConnections({
    id,
    handleType: 'target',
  });

  const sourceConnections = useNodeConnections({
    id,
    handleType: 'source',
  });

  useEffect(() => {
    if (data.logic) {
      setLogicState(data.logic);
    }
  }, [data.logic]);

  useEffect(() => {
    /* @kvoip-woulz proprietary:begin */
    const currentNode = allNodes.find((n) => n.id === thisNodeId);
    const currentNodeData = currentNode?.data || data;
    /* @kvoip-woulz proprietary:end */

    if (targetConnections.length > 0) {
      const connection = targetConnections[0];
      const sourceHandle = connection.sourceHandle || '';
      const sourceNodeId = connection.source;

      /* @kvoip-woulz proprietary:begin */
      const sourceNode = allNodes.find((n) => n.id === sourceNodeId);
      const sourceNodeData = sourceNode?.data || {};

      // If the start node receives an incoming connection, set the previous node as the new start node
      handleIncomingConnection(thisNodeId!, sourceNodeId, allNodes);
      /* @kvoip-woulz proprietary:end */

      // Update current node with incoming connection info
      updateNodeData(thisNodeId!, {
        ...currentNodeData,
        incomingEdgeId: sourceHandle,
        incomingNodeId: sourceNodeId,
      });

      // Update source node with outgoing connection info
      updateNodeData(sourceNodeId!, {
        ...sourceNodeData,
        outgoingEdgeId: sourceHandle,
        outgoingNodeId: thisNodeId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetConnections, allNodes, thisNodeId, data.nodeStart]);

  useEffect(() => {
    if (!logicState.logicNodeData.length) return;

    const updatedLogic = {
      logicNodes: [...logicState.logicNodes],
      logicNodeData: logicState.logicNodeData.map((nodeData) => {
        const handleId = `b-${nodeData.option}`;
        const conn = sourceConnections.find((c) => c.sourceHandle === handleId);

        return {
          ...nodeData,
          outgoingEdgeId: conn?.sourceHandle || '',
          outgoingNodeId: conn?.target || '',
        };
      }),
    };

    /* @kvoip-woulz proprietary:begin */
    const currentNode = allNodes.find((n) => n.id === thisNodeId);
    const currentNodeData = currentNode?.data || data;
    /* @kvoip-woulz proprietary:end */

    updateNodeData(thisNodeId!, {
      ...currentNodeData,
      logic: updatedLogic,
    });

    setLogicState(updatedLogic);
  }, [sourceConnections, allNodes, thisNodeId, data]);

  if (thisNode)
    return (
      <BaseNode
        icon={'IconHierarchy'}
        isInitialNode={thisNode?.data.nodeStart as boolean}
        nodeId={thisNode.id}
        nodeTypeDescription="If/else node"
        onTitleChange={(e) => setTitleInput(e)}
        onTitleBlur={() => {
          saveDataValue(
            'title',
            titleInput ? titleInput : 'Conditional Node',
            thisNode,
          );
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
            <ChatbotFlowConditionalEventForm selectedNode={thisNode} />
          </StyledLogicNodeWrapper>
        </StyledDiv>
      </BaseNode>
    );
}

export default memo(ConditionalNode);
