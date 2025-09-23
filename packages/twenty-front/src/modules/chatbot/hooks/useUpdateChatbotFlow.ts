import { UPDATE_CHATBOT_FLOW } from '@/chatbot/graphql/mutation/updateChatbotFlow';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { UpdateChatbotFlow } from '@/chatbot/types/chatbotFlow.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

interface UseUpdateChatbotFlowReturn {
  updateFlow: (updateChatbotInput: UpdateChatbotFlow) => Promise<any>;
}

export const useUpdateChatbotFlow = (): UseUpdateChatbotFlowReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const setChatbotFlow = useSetRecoilState(chatbotFlowState);
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

    setChatbotFlow(data?.updateChatbotFlow);
  }, [data]);

  const updateFlow = async (updateChatbotInput: UpdateChatbotFlow) => {
    await updateChatbotFlow({
      variables: { updateChatbotInput },
    });
  };

  return {
    updateFlow,
  };
};
