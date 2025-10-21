/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable react-hooks/exhaustive-deps */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { GenericNodeData } from '@/chatbot/types/GenericNode';
import { NewConditionalState } from '@/chatbot/types/LogicNodeDataType';
import styled from '@emotion/styled';
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
import { useRecoilValue } from 'recoil';
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
  const thisNode = useNodes().find((node) => node.id === thisNodeId);

  const { updateNodeData } = useReactFlow();
  const { saveDataValue } = useHandleNodeValue();

  const selectedNode = useRecoilValue(chatbotFlowSelectedNodeState);

  const sourceConnections = useNodeConnections({
    id,
    handleType: 'source',
  });

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (data.logic) {
      setLogicState(data.logic);
    }
  }, [data.logic]);

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

    updateNodeData(id, {
      ...data,
      logic: updatedLogic,
    });

    setLogicState(updatedLogic);
  }, [sourceConnections]);

  if (thisNode)
    return (
      <BaseNode
        icon={'IconHierarchy'}
        title={data.title ?? 'Conditional Node'}
        //add this description to node data
        nodeTypeDescription="If/else node"
        onTitleChange={(e) => setTitleInput(e)}
        onTitleBlur={() => {
          saveDataValue(
            'title',
            titleInput ? titleInput : 'Conditional Node',
            thisNode,
          );
        }}
        isSelected={selectedNode?.id === thisNodeId}
      >
        <Handle
          title={data.title}
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
