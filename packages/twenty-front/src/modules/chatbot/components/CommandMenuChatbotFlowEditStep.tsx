import { ChatbotFlowConditionalEventForm } from '@/chatbot/components/actions/ChatbotFlowConditionalEventForm';
import { ChatbotFlowFileEventForm } from '@/chatbot/components/actions/ChatbotFlowFileEventForm';
import { ChatbotFlowImageEventForm } from '@/chatbot/components/actions/ChatbotFlowImageEventForm';
import { ChatbotFlowTextEventForm } from '@/chatbot/components/actions/ChatbotFlowTextEventForm';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CommandMenuChatbotFlowEditStep = () => {
  const chatbotFlowSelectedNode = useRecoilValue(chatbotFlowSelectedNodeState);

  let content = null;

  switch (chatbotFlowSelectedNode?.type) {
    case 'text': {
      content = (
        <ChatbotFlowTextEventForm selectedNode={chatbotFlowSelectedNode} />
      );

      break;
    }
    case 'condition': {
      content = (
        <ChatbotFlowConditionalEventForm
          selectedNode={chatbotFlowSelectedNode}
        />
      );
      break;
    }
    case 'image': {
      content = (
        <ChatbotFlowImageEventForm selectedNode={chatbotFlowSelectedNode} />
      );
      break;
    }
    case 'file': {
      content = (
        <ChatbotFlowFileEventForm selectedNode={chatbotFlowSelectedNode} />
      );
      break;
    }
  }

  return <StyledContainer>{content}</StyledContainer>;
};
