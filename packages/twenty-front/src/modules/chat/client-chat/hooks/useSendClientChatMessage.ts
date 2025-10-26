import { SEND_CLIENT_CHAT_MESSAGE } from '@/chat/client-chat/graphql/mutation/sendClientChatMessage';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { ChatMessageType, ClientChatMessage } from 'twenty-shared/types';

export const useSendClientChatMessage = () => {
  //todo: make everything optional except for a few fields
  //set everything to null by default
  const { enqueueErrorSnackBar } = useSnackBar();
  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const workspaceMemberName =
    workspaceMemberWithAgent?.name?.firstName +
    ' ' +
    workspaceMemberWithAgent?.name?.lastName;

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
    input: Omit<
      ClientChatMessage,
      'providerMessageId' | 'createdAt' | 'updatedAt'
    > & {
      workspaceId: string;
      providerIntegrationId: string;
    },
  ) => {
    if (input.type === ChatMessageType.TEXT) {
      if (input.textBody) {
        input.textBody = `*${workspaceMemberName}*:\n${input.textBody}`;
      }
    }
    await sendClientChatMessageMutation({
      variables: {
        input,
      },
    });
  };

  return { sendClientChatMessage };
};
