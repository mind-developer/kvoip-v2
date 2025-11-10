import {
  chatbotFlowChatbotId,
  chatbotFlowEdges,
  chatbotFlowNodes,
  chatbotFlowViewport,
} from '@/chatbot/state/chatbotFlowState';
import { type ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { useRecoilValue } from 'recoil';

export const useGetChatbotFlowState = (): ChatbotFlowData => {
  const nodes = useRecoilValue(chatbotFlowNodes);
  const edges = useRecoilValue(chatbotFlowEdges);
  const viewport = useRecoilValue(chatbotFlowViewport);
  const chatbotId = useRecoilValue(chatbotFlowChatbotId);
  return {
    nodes,
    edges,
    viewport,
    chatbotId,
  };
};
