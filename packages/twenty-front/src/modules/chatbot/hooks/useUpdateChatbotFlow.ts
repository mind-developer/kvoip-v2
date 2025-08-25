import { UPDATE_CHATBOT_FLOW } from '@/chatbot/graphql/mutation/updateChatbotFlow';
import { ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useEffect } from 'react';

interface UseUpdateChatbotFlowReturn {
  updateFlow: (updateChatbotInput: ChatbotFlowData) => Promise<any>;
}

export const useUpdateChatbotFlow = (): UseUpdateChatbotFlowReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateChatbotFlow, { data }] = useMutation(UPDATE_CHATBOT_FLOW, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: () => {
      enqueueSnackBar('Flow updated successfully!', {
        variant: SnackBarVariant.Success,
      });
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }
  }, [data]);

  const updateFlow = async (updateChatbotInput: ChatbotFlowData) => {
    await updateChatbotFlow({
      variables: { updateChatbotInput },
    });
  };

  return {
    updateFlow,
  };
};
