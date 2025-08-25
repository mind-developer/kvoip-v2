import { useMutation } from "@apollo/client";
import { useSnackBar } from "@/ui/feedback/snack-bar-manager/hooks/useSnackBar";

import { SnackBarVariant } from "@/ui/feedback/snack-bar-manager/components/SnackBar";
import { ChatbotFlowData } from "../types/chatbotFlow.type";

import { UPDATE_CHATBOT_FLOW } from "../graphql/mutation/updateChatbotFlow";

import { useRecoilState } from "recoil";
import { chatbotFlowState } from "../state/chatbotFlowState";

export const useSaveChatbotFlowState = () => {
  const { enqueueSnackBar } = useSnackBar();
  const chatbotFlow = useRecoilState(chatbotFlowState)
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

  const saveChatbotFlowState = async (chatbotFlow: ChatbotFlowData) => {
    await updateChatbotFlow({ variables: { updateChatbotInput: chatbotFlow } })
  }

  return saveChatbotFlowState
}
