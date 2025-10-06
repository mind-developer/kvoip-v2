import { SEND_WHATSAPP_EVENT_MESSAGE } from '@/chat/call-center/graphql/mutation/sendWhatsappEventMessage';
import { SendWhatsAppEventMessageInput } from '@/chat/call-center/types/SendWhatsAppMessage';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendWhatsAppEventMessageReturn {
  sendWhatsappEventMessage: (
    sendWhatsAppEventMessageInput: SendWhatsAppEventMessageInput,
  ) => Promise<void>;
}

export const useSendWhatsappEventMessage =
  (): SendWhatsAppEventMessageReturn => {
    const { enqueueErrorSnackBar } = useSnackBar();

    const [sendEventMessageMutation] = useMutation(
      SEND_WHATSAPP_EVENT_MESSAGE,
      {
        onError: (error) => {
          enqueueErrorSnackBar({
        message: (error as Error).message,
      });
        },
      },
    );

    const sendWhatsAppEventMessage = async (
      sendWhatsAppEventMessageInput: SendWhatsAppEventMessageInput,
    ) => {
      await sendEventMessageMutation({
        variables: {
          sendWhatsAppEventMessageInput,
        },
      });
    };

    return {
      sendWhatsappEventMessage: sendWhatsAppEventMessage,
    };
  };
