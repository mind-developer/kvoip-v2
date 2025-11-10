/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { GET_CHATBOT_FLOW_BY_ID } from '@/chatbot/graphql/query/getChatbotFlowById';
import { useSaveChatbotFlowState } from '@/chatbot/hooks/useSaveChatbotFlowState';
import { ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { useQuery } from '@apollo/client';
import { initialEdges, initialNodes } from '../flow-templates/mockFlowTemplate';

export const useGetChatbotFlowById = (
  chatbotId: string,
): ChatbotFlowData | null => {
  const saveChatbotFlowState = useSaveChatbotFlowState();
  const { data } = useQuery(GET_CHATBOT_FLOW_BY_ID, {
    variables: { chatbotId },
    onCompleted: (d) => {
      if (d.errors) {
        saveChatbotFlowState({
          nodes: initialNodes,
          edges: initialEdges,
          chatbotId: chatbotId,
        });
      }
    },
  });

  return data;
};
