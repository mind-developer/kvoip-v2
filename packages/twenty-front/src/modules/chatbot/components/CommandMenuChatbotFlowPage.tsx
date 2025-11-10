import {
  ChatbotAction,
  NODE_ACTIONS,
  OTHER_NODE_ACTIONS,
} from '@/chatbot/constants/NodeActions';
import { createNode } from '@/chatbot/utils/createNode';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { useSetChatbotFlowState } from '@/chatbot/hooks/useSetChatbotFlowState';

export const CommandMenuChatbotFlowPage = () => {
  const { getIcon } = useIcons();

  const { setChatbotFlowState } = useSetChatbotFlowState();
  const chatbotFlow = useGetChatbotFlowState();

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

    const updatedChatbotFlow = {
      chatbotId: chatbotFlow.chatbotId,
      edges: [...chatbotFlow.edges],
      nodes: [...chatbotFlow.nodes, newNode],
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    // saveChatbotFlowState(updatedChatbotFlow);
    setChatbotFlowState(updatedChatbotFlow);
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
