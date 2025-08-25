import { ChatbotFlowEventContainerForm } from '@/chatbot/components/actions/ChatbotFlowEventContainerForm';
import { LogicOption } from '@/chatbot/components/nodes/LogicOption';
import { useDeleteSelectedNode } from '@/chatbot/hooks/useDeleteSelectedNode';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { GenericNode } from '@/chatbot/types/GenericNode';
import {
  NewConditionalState,
  NewLogicNodeData,
} from '@/chatbot/types/LogicNodeDataType';
import { getChatbotNodeLabel } from '@/chatbot/utils/getChatbotNodeLabel';
import { TextArea } from '@/ui/input/components/TextArea';
import { TitleInput } from '@/ui/input/components/TitleInput';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconPlus, Label } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type ChatbotFlowCondicionalEventFormProps = {
  selectedNode: GenericNode;
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
  overflow-y: scroll;
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

export const ChatbotFlowConditionalEventForm = ({
  selectedNode,
}: ChatbotFlowCondicionalEventFormProps) => {
  const initialText =
    (selectedNode.data?.text) ?? '';

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("Conditional Node");
  const [text, setText] = useState<string>(initialText);
  const [nodeData, setNodeData] = useState<NewConditionalState>(initialState);

  const { updateFlow } = useUpdateChatbotFlow();
  const { deleteSelectedNode } = useDeleteSelectedNode();
  const { saveDataValue } = useHandleNodeValue()

  const chatbotFlow = useRecoilValue(chatbotFlowState);
  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (selectedNode.data.logic) {
      setNodeData(selectedNode.data.logic);
    }
  }, [selectedNode.data.logic]);

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (textareaRef.current) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [selectedNode.data.text]);

  useEffect(() => {
    if (!selectedNode.data.logic) {
      addCondition();
    }
  }, [selectedNode.data.logic]);

  const handleInputChange = (e: string) => {
    if (e.length > 4000) {
      return;
    }
    setText(e)
  };

  const persistNode = (updatedLogic?: NewConditionalState) => {
    if (!chatbotFlow) return;

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        title,
        text,
        logic: updatedLogic ?? nodeData,
      },
    };

    const updatedNodes = chatbotFlow.nodes.map((n: GenericNode) =>
      n.id === selectedNode.id ? updatedNode : n,
    );

    // TODO: Build a type using Omit<...> instead.
    const { ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: updatedNodes,
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    setChatbotFlowSelectedNode(updatedNode);
    updateFlow(updatedChatbotFlow);
  };

  const handleTextBlur = () => {
    saveDataValue('text', text, selectedNode)
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

    saveDataValue('logic', updated, selectedNode)
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
          label={`Message body (${text.length}/4000)`}
          placeholder="Insert text to be sent"
          value={text}
          onChange={handleInputChange}
          disabled={text.length >= 4000}
          onBlur={handleTextBlur}
        />
        {nodeData.logicNodes.map((_, index) => {
          return (
            <LogicOption
              key={index}
              nodeIndex={index}
              condition={nodeData.logicNodeData[index]}
              onDelete={() => deleteCondition(index)}
              onUpdate={(updates) => updateCondition(index, updates)}
              showDeleteButton={nodeData.logicNodes.length > 1}
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
