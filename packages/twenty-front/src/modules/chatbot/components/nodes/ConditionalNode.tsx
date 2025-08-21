/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/nodes/BaseNode';
import { StyledOption } from '@/chatbot/components/ui/StyledOption';
import {
  NewConditionalState,
  RecordType,
} from '@/chatbot/types/LogicNodeDataType';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import {
  Handle,
  Node,
  NodeProps,
  Position,
  useNodeConnections,
  useReactFlow,
} from '@xyflow/react';
import { memo, useEffect, useState } from 'react';
import { Label } from 'twenty-ui/display';

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

const StyledOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled(Label)`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledHandle = styled(Handle)`
  position: absolute;
  right: 0;
`;

function ConditionalNode({
  id,
  data,
  isConnectable,
}: NodeProps<
  Node<{ title: string; text?: string; logic: NewConditionalState }>
>) {
  const [state, setState] = useState<NewConditionalState>(initialState);

  const { updateNodeData } = useReactFlow();
  const { sectors } = useFindAllSectors();

  const sourceConnections = useNodeConnections({
    id,
    handleType: 'source',
  });

  const handleTitleChange = (e: string) => {
    updateNodeData(id, {
      ...data,
      title: e,
    });
  };
  const handleMessageBodyChange = (e: string) => {
    updateNodeData(id, {
      text: e,
    });
  };

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (data.logic) {
      setState(data.logic);
    }
  }, [data.logic]);

  useEffect(() => {
    if (!state.logicNodeData.length) return;

    const updatedLogic = {
      logicNodes: [...state.logicNodes],
      logicNodeData: state.logicNodeData.map((nodeData) => {
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

    setState(updatedLogic);
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

  return (
    <BaseNode
      icon={'IconHierarchy'}
      title={data.title ?? 'Conditional Node'}
      nodeTypeDescription="Conditional node"
      onTitleChange={handleTitleChange}
      onTitleBlur={() => {}}
    >
      <Handle
        title={data.title}
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <StyledDiv>
        <StyledLogicNodeWrapper>
          {data.text && (
            <>
              <StyledLabel>Message body</StyledLabel>
              <TextArea
                placeholder="Text message to be sent"
                value={data.text}
                onChange={handleMessageBodyChange}
              />
            </>
          )}
          <StyledLabel>Options</StyledLabel>
          <StyledOptionsContainer>
            {state.logicNodeData.map((nodeData) => {
              return (
                <StyledOption icon="IconPoint" key={nodeData.option}>
                  {nodeData.option}. {getDisplayValueForCondition(nodeData)}
                  <StyledHandle
                    id={`b-${nodeData.option}`}
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                  />
                </StyledOption>
              );
            })}
          </StyledOptionsContainer>
        </StyledLogicNodeWrapper>
      </StyledDiv>
    </BaseNode>
  );
}

export default memo(ConditionalNode);
