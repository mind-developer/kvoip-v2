import { SEND_CLIENT_CHAT_MESSAGE } from '@/chat/call-center/graphql/mutation/sendClientChatMessage';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { ClientChatMessage } from 'twenty-shared/types';

export const useSendClientChatMessage = () => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const [sendClientChatMessageMutation] = useMutation(
    SEND_CLIENT_CHAT_MESSAGE,
    {
      onError: (error) => {
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
    },
  );

  const sendClientChatMessage = async (
    input: Omit<ClientChatMessage, 'providerMessageId'>,
  ) => {
    await sendClientChatMessageMutation({ variables: { input } });
  };

  return { sendClientChatMessage };
};
