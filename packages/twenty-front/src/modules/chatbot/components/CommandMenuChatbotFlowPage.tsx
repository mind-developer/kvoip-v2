import {
  ChatbotAction,
  NODE_ACTIONS,
  OTHER_NODE_ACTIONS,
} from '@/chatbot/constants/NodeActions';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { createNode } from '@/chatbot/utils/createNode';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

export const CommandMenuChatbotFlowPage = () => {
  const { getIcon } = useIcons();

  const chatbotFlow = useRecoilValue(chatbotFlowState);

  const { updateFlow } = useUpdateChatbotFlow();

  const handleAddNode = (action: ChatbotAction) => {
    if (!chatbotFlow) {
      return;
    }

    const newNode = createNode(action.type);

    if (!newNode) {
      // eslint-disable-next-line no-console
      console.error('Failed to create a new node');
      return;
    }

    // @ts-expect-error 'id', '__typename' and 'workspace' don't exist in 'chatbotFlow'.
    // TODO: Build a type using Omit<...> instead.
    const { id, __typename, workspace, ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: [...chatbotFlow.nodes, newNode],
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    updateFlow(updatedChatbotFlow);
  };

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        Node Type
      </RightDrawerWorkflowSelectStepTitle>
      {NODE_ACTIONS.map((action) => (
        <MenuItemCommand
          key={action.type}
          LeftIcon={getIcon(action.icon)}
          text={action.label}
          onClick={() => handleAddNode(action)}
        />
      ))}
      <RightDrawerWorkflowSelectStepTitle>
        Conditions
      </RightDrawerWorkflowSelectStepTitle>
      {OTHER_NODE_ACTIONS.map((action) => (
        <MenuItemCommand
          key={action.type}
          LeftIcon={getIcon(action.icon)}
          text={action.label}
          onClick={() => handleAddNode(action)}
        />
      ))}
    </RightDrawerStepListContainer>
  );
};
