import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SEND_CLIENT_CHAT_MESSAGE } from '@/chat/client-chat/graphql/mutation/sendClientChatMessage';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import {
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageType,
  ClientChatMessage,
} from 'twenty-shared/types';

export const useSendClientChatMessage = () => {
  //todo: make everything optional except for a few fields
  //set everything to null by default
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspaceId = useRecoilValue(currentWorkspaceState)?.id;
  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const workspaceMemberName =
    workspaceMemberWithAgent?.name?.firstName +
    ' ' +
    workspaceMemberWithAgent?.name?.lastName;

  const [sendClientChatMessageMutation, { loading }] = useMutation(
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
    input: Pick<
      ClientChatMessage,
      | 'clientChatId'
      | 'from'
      | 'to'
      | 'provider'
      | 'type'
      | 'fromType'
      | 'toType'
    > & {
      providerIntegrationId: string;
    } & Partial<
        Omit<
          ClientChatMessage,
          | 'clientChatId'
          | 'from'
          | 'to'
          | 'provider'
          | 'type'
          | 'fromType'
          | 'toType'
        >
      >,
  ) => {
    const nulledInput = {
      clientChatId: input.clientChatId ?? null,
      from: input.from ?? null,
      fromType: input.fromType ?? null,
      to: input.to ?? null,
      toType: input.toType ?? null,
      provider: input.provider ?? null,
      type: input.type ?? null,
      textBody: input.textBody ?? null,
      caption: input.caption ?? null,
      deliveryStatus: input.deliveryStatus ?? ChatMessageDeliveryStatus.PENDING,
      edited: input.edited ?? null,
      attachmentUrl: input.attachmentUrl ?? null,
      event: input.event ?? null,
      reactions: input.reactions ?? null,
      repliesTo: input.repliesTo ?? null,
      workspaceId: currentWorkspaceId ?? '',
      providerIntegrationId: input.providerIntegrationId ?? null,
      templateId: input.templateId ?? null,
      templateLanguage: input.templateLanguage ?? null,
    };
    if (
      nulledInput.type === ChatMessageType.TEXT &&
      nulledInput.fromType === ChatMessageFromType.AGENT
    ) {
      if (nulledInput.textBody) {
        nulledInput.textBody = `${workspaceMemberName}:\n${nulledInput.textBody}`;
      }
    }
    await sendClientChatMessageMutation({
      variables: {
        input: nulledInput,
      },
    });
  };

  return { sendClientChatMessage, loading };
};
