import { ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { createState } from 'twenty-ui/utilities';

export const chatbotFlowState = createState<ChatbotFlowData | null>({
  key: 'chatbotFlowState',
  defaultValue: null,
});
