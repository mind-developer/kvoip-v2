import { SEND_EVENT_MESSAGE } from '@/chat/call-center/graphql/mutation/sendWhatsappEventMessage';
import { SendWhatsAppEventMessageInput } from '@/chat/call-center/types/SendWhatsAppMessage';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendEventMessageReturn {
  sendWhatsappEventMessage: (
    sendEventMessageInput: SendWhatsAppEventMessageInput,
  ) => Promise<void>;
}

export const useSendWhatsappEventMessage = (): SendEventMessageReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [sendEventMessageMutation] = useMutation(SEND_EVENT_MESSAGE, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const sendEventMessage = async (
    sendEventMessageInput: SendWhatsAppEventMessageInput,
  ) => {
    await sendEventMessageMutation({
      variables: {
        sendEventMessageInput,
      },
    });
  };

  return {
    sendWhatsappEventMessage: sendEventMessage,
  };
};
