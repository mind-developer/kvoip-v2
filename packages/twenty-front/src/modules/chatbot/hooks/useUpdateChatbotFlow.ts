import { UPDATE_CHATBOT_FLOW } from '@/chatbot/graphql/mutation/updateChatbotFlow';
import { ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

interface UseUpdateChatbotFlowReturn {
  updateFlow: (updateChatbotInput: ChatbotFlowData) => Promise<any>;
}

export const useUpdateChatbotFlow = (): UseUpdateChatbotFlowReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { t } = useLingui();

  const [updateChatbotFlow, { data }] = useMutation(UPDATE_CHATBOT_FLOW, {
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
    onCompleted: () => {
      enqueueSuccessSnackBar({
        message: t`Flow updated successfully!`,
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
