/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import {
  NewConditionalState,
  RecordType,
} from '@/chatbot/types/LogicNodeDataType';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
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
import { ChatbotFlowConditionalEventForm } from '../actions/ChatbotFlowConditionalEventForm'
import { GenericNodeData } from '@/chatbot/types/GenericNode';

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
}: NodeProps<
  Node<GenericNodeData>
>) {
  const [logicState, setLogicState] = useState<NewConditionalState>(initialState);
  const [titleInput, setTitleInput] = useState(data.title ?? "");

  const thisNodeId = useNodeId()
  const thisNode = useNodes().find(node => node.id === thisNodeId)

  const { updateNodeData } = useReactFlow();
  const { saveDataValue } = useHandleNodeValue()
  const { sectors } = useFindAllSectors();

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

  function getDisplayValueForCondition(condition: {
    recordType?: RecordType;
    message?: string;
    sectorId?: string;
  }) {
    if (condition.recordType === 'text') {
      return condition.message?.trim() || '';
    }

    if (condition.recordType === 'sectors') {
      const getSectorName = (sectorId: string) =>
        sectors?.find((s) => s.id === sectorId)?.name ?? sectorId;

      return getSectorName(condition.sectorId || '');
    }
  }

  if (thisNode) return (
    <BaseNode
      icon={'IconHierarchy'}
      title={data.title ?? 'Conditional Node'}
      //add this description to node data
      nodeTypeDescription="If/else node"
      onTitleChange={e => setTitleInput(e)}
      onTitleBlur={() => { saveDataValue('title', titleInput ? titleInput : 'Conditional Node', thisNode) }}
    >
      <Handle
        title={data.title}
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
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
