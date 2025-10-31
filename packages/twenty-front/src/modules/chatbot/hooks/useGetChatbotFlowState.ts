import { type ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { useRecoilValue } from 'recoil';

export const useGetChatbotFlowState = (): ChatbotFlowData => {
  const chatbotFlowNodes = useRecoilValue(chatbotFlowNodes);
  const chatbotFlowEdges = useRecoilValue(chatbotFlowEdges);
  const chatbotFlowViewport = useRecoilValue(chatbotFlowViewport);
  const chatbotFlowChatbotId = useRecoilValue(chatbotFlowChatbotId);
  return {
    nodes,
    edges,
    viewport,
    chatbotId,
  };
};
