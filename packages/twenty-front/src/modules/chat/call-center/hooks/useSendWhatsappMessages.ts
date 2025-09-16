import { SEND_WHATSAPP_MESSAGE } from '@/chat/call-center/graphql/mutation/sendWhatsappMessage';
import { SendWhatsAppMessageInput } from '@/chat/call-center/types/SendWhatsAppMessage';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendWhatsAppMessageReturn {
  sendWhatsappMessage: (
    sendWhatsAppMessageInput: SendWhatsAppMessageInput,
  ) => Promise<void>;
}

export const useSendWhatsappMessages = (): SendWhatsAppMessageReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [sendWhatsAppMessageMutation] = useMutation(SEND_WHATSAPP_MESSAGE, {
    onError: (error) => {
      enqueueSnackBar('gql: ' + error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const sendWhatsappMessage = async (
    sendWhatsAppMessageInput: SendWhatsAppMessageInput,
  ) => {
    await sendWhatsAppMessageMutation({
      variables: {
        sendWhatsAppMessageInput,
      },
    });
  };

  return {
    sendWhatsappMessage,
  };
};

export type SendWhatsAppMessageType = ReturnType<
  typeof useSendWhatsappMessages
>['sendWhatsappMessage'];
