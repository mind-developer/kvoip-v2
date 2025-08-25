import { GET_CHATBOT_FLOW_BY_ID } from '@/chatbot/graphql/query/getChatbotFlowById';
import { ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { useQuery } from '@apollo/client';
import { useSaveChatbotFlowState } from './useSaveChatbotState';
import { initialEdges, initialNodes } from '../flow-templates/mockFlowTemplate';

export const useGetChatbotFlowById = (
  chatbotId: string,
): ChatbotFlowData | null => {
  const saveChatbotFlowState = useSaveChatbotFlowState()
  const { data, refetch } = useQuery(GET_CHATBOT_FLOW_BY_ID, {
    variables: { chatbotId },
    onCompleted: (d) => {
      if (d.errors) {
        console.log('error')
        saveChatbotFlowState({ nodes: initialNodes, edges: initialEdges, chatbotId: chatbotId })
      }
    }
  });

  return data
};
