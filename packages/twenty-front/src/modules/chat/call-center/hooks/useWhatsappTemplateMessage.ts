import { SEND_TEMPLATE } from '@/chat/call-center/graphql/mutation/sendWhatsappTemplateMessage';
import { SendTemplateInput } from '@/chat/call-center/types/SendTemplateInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendTemplateReturn {
  sendWhatsappTemplateMessage: (
    sendTemplateInput: SendTemplateInput,
  ) => Promise<void>;
}

export const useWhatsappTemplateMessage = (): SendTemplateReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const [sendTemplateMutation] = useMutation(SEND_TEMPLATE, {
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  const sendWhatsappTemplateMessage = async (
    sendTemplateInput: SendTemplateInput,
  ) => {
    await sendTemplateMutation({
      variables: {
        sendTemplateInput,
      },
    });
  };

  return {
    sendWhatsappTemplateMessage,
  };
};
