import { SEND_WHATSAPP_TEMPLATE } from '@/chat/call-center/graphql/mutation/sendWhatsappTemplateMessage';
import { SendWhatsAppTemplateInput } from '@/chat/call-center/types/SendWhatsAppTemplateInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendWhatsAppTemplateReturn {
  sendWhatsappTemplateMessage: (
    sendWhatsAppTemplateInput: SendWhatsAppTemplateInput,
  ) => Promise<void>;
}

export const useWhatsappTemplateMessage = (): SendWhatsAppTemplateReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const [sendWhatsAppTemplateMutation] = useMutation(SEND_WHATSAPP_TEMPLATE, {
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  const sendWhatsappTemplateMessage = async (
    sendWhatsAppTemplateInput: SendWhatsAppTemplateInput,
  ) => {
    await sendWhatsAppTemplateMutation({
      variables: {
        sendWhatsAppTemplateInput,
      },
    });
  };

  return {
    sendWhatsappTemplateMessage,
  };
};
