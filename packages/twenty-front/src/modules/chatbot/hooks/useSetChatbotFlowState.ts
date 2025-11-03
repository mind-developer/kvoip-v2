import {
  chatbotFlowChatbotId,
  chatbotFlowEdges,
  chatbotFlowNodes,
  chatbotFlowViewport,
} from '@/chatbot/state/chatbotFlowState';
import { type ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { useSetRecoilState } from 'recoil';

export function useSetChatbotFlowState() {
  const setNodes = useSetRecoilState(chatbotFlowNodes);
  const setEdges = useSetRecoilState(chatbotFlowEdges);
  const setViewport = useSetRecoilState(chatbotFlowViewport);
  const setChatbotId = useSetRecoilState(chatbotFlowChatbotId);
  const setChatbotFlowState = (data: ChatbotFlowData) => {
    setNodes(data.nodes);
    setEdges(data.edges);
    setViewport(data.viewport);
    setChatbotId(data.chatbotId);
  };

  return { setChatbotFlowState };
}
