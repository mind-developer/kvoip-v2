/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable react-hooks/exhaustive-deps */
import { ChatbotFlowEventContainerForm } from '@/chatbot/components/actions/ChatbotFlowEventContainerForm';
import { LogicOption } from '@/chatbot/components/nodes/LogicOption';
import { useDeleteSelectedNode } from '@/chatbot/hooks/useDeleteSelectedNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { type GenericNode } from '@/chatbot/types/GenericNode';
import {
  type NewConditionalState,
  type NewLogicNodeData,
} from '@/chatbot/types/LogicNodeDataType';
import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import { useUpdateNodeInternals } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type ChatbotFlowConditionalEventFormProps = {
  selectedNode: GenericNode;
  isConnectable?: boolean;
};

const initialState: NewConditionalState = {
  logicNodes: [],
  logicNodeData: [],
};

const StyledStepBody = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overflow-x: visible;
  row-gap: ${({ theme }) => theme.spacing(4)};
  position: relative;
  width: 100%;
  padding-right: 25px;
  margin-right: -25px;
`;

export const ChatbotFlowConditionalEventForm = ({
  selectedNode,
  isConnectable = true,
}: ChatbotFlowConditionalEventFormProps) => {
  const initialText = selectedNode.data?.text ?? '';

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState<string>(initialText);

  const { deleteSelectedNode } = useDeleteSelectedNode();
  const { saveDataValue } = useHandleNodeValue();

  const updateNodeInternals = useUpdateNodeInternals();

  const nodeData =
    (selectedNode.data.logic as NewConditionalState) ?? initialState;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [selectedNode.data.text]);

  useEffect(() => {
    if (!selectedNode.data.logic) {
      const newIndex = initialState.logicNodes.length;

      const newCondition: NewLogicNodeData = {
        option: `${newIndex + 1}`,
        comparison: '==',
        sectorId: '',
        conditionValue: '||',
        recordType: '',
      };

      const updated = {
        logicNodes: [...initialState.logicNodes, newIndex],
        logicNodeData: [...initialState.logicNodeData, newCondition],
      };

      saveDataValue('logic', updated, selectedNode);
    }
  }, [selectedNode.data.logic, saveDataValue, selectedNode]);

  const handleInputChange = (e: string) => {
    if (e.length > 4000) {
      return;
    }
    setText(e);
  };

  const handleTextBlur = () => {
    saveDataValue('text', text, selectedNode);
  };

  const addCondition = () => {
    const newIndex = nodeData.logicNodes.length;

    const newCondition: NewLogicNodeData = {
      option: `${newIndex + 1}`,
      comparison: '==',
      sectorId: '',
      conditionValue: '||',
      recordType: '',
    };

    const updated = {
      logicNodes: [...nodeData.logicNodes, newIndex],
      logicNodeData: [...nodeData.logicNodeData, newCondition],
    };

    saveDataValue('logic', updated, selectedNode);
  };

  const updateCondition = (index: number, updates: NewLogicNodeData) => {
    const newData = [...nodeData.logicNodeData];
    newData[index] = updates;

    const updated = { ...nodeData, logicNodeData: newData };

    saveDataValue('logic', updated, selectedNode);
    updateNodeInternals(selectedNode.id);
  };

  const deleteCondition = (index: number) => {
    if (nodeData.logicNodes.length <= 1) return;

    const newNodes = nodeData.logicNodes.filter((_, i) => i !== index);
    const newData = nodeData.logicNodeData
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, option: `${i + 1}` }));

    const updated = { logicNodes: newNodes, logicNodeData: newData };

    saveDataValue('logic', updated, selectedNode);
  };

  return (
    <ChatbotFlowEventContainerForm
      onClick={() => deleteSelectedNode(selectedNode.id)}
    >
      <StyledStepBody>
        <TextArea
          textAreaId="conditional-event-form-text-area"
          label={`Message body (${text.length}/4000)`}
          placeholder="Insert text to be sent"
          value={text}
          onChange={handleInputChange}
          disabled={text.length >= 4000}
          onBlur={handleTextBlur}
        />
        {nodeData.logicNodes.map((_, index) => {
          const condition = nodeData.logicNodeData[index];
          return (
            <LogicOption
              key={condition?.option || index}
              nodeIndex={index}
              condition={condition}
              onDelete={() => deleteCondition(index)}
              onUpdate={(updates) => updateCondition(index, updates)}
              showDeleteButton={nodeData.logicNodes.length > 1}
              isConnectable={isConnectable}
            />
          );
        })}
        <Button
          onClick={addCondition}
          title={'Add option'}
          Icon={IconPlus}
          justify="center"
        />
      </StyledStepBody>
    </ChatbotFlowEventContainerForm>
  );
};
