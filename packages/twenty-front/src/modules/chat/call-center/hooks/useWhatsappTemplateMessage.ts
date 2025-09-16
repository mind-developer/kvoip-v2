import { SEND_TEMPLATE } from '@/chat/call-center/graphql/mutation/sendWhatsappTemplateMessage';
import { SendWhatsAppTemplateInput } from '@/chat/call-center/types/SendWhatsAppTemplateInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendWhatsAppTemplateReturn {
  sendWhatsappTemplateMessage: (
    sendWhatsAppTemplateInput: SendWhatsAppTemplateInput,
  ) => Promise<void>;
}

export const useWhatsappTemplateMessage = (): SendWhatsAppTemplateReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [sendWhatsAppTemplateMutation] = useMutation(SEND_TEMPLATE, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
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
