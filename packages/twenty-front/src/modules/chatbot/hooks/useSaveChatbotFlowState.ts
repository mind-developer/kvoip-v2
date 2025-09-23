import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

import { ChatbotFlowData } from '../types/chatbotFlow.type';

import { UPDATE_CHATBOT_FLOW } from '../graphql/mutation/updateChatbotFlow';

export const useSaveChatbotFlowState = () => {
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();
  const [updateChatbotFlow] = useMutation(UPDATE_CHATBOT_FLOW, {
    onError: (error) => {
      enqueueErrorSnackBar({ message: error.message });
    },
    onCompleted: () => {
      enqueueInfoSnackBar({ message: 'Flow updated.' });
    },
  });

  const saveChatbotFlowState = async (chatbotFlow: ChatbotFlowData) => {
    await updateChatbotFlow({ variables: { updateChatbotInput: chatbotFlow } });
  };

  return saveChatbotFlowState;
};
