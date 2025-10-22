import { useClientChatSubscription } from '@/chat/call-center/hooks/useClientChatSubscription';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClientChat, ClientChatStatus } from 'twenty-shared/types';

export const useClientChats = (sectorId: string) => {
  const { t } = useLingui();
  const { chatId: openChat } = useParams();
  const [dbChats, setDbChats] = useState<ClientChat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();
  useFindManyRecords<ClientChat & { __typename: string; id: string }>({
    objectNameSingular: 'clientChat',
    recordGqlFields: {
      id: true,
      providerContactId: true,
      status: true,
      updatedAt: true,
      lastMessagePreview: true,
      lastMessageType: true,
      lastMessageDate: true,
      agent: {
        id: true,
      },
      sector: {
        name: true,
        id: true,
      },
      agentId: true,
      person: {
        id: true,
        avatarUrl: true,
        name: {
          firstName: true,
          lastName: true,
        },
      },
      unreadMessagesCount: true,
      whatsappIntegrationId: true,
      messengerIntegrationId: true,
      telegramIntegrationId: true,
      provider: true,
    },
    filter: {
      or: [
        { status: { eq: ClientChatStatus.ABANDONED } },
        { sectorId: { eq: sectorId } },
      ],
    },
    limit: 500,
    orderBy: [{ createdAt: 'AscNullsFirst' }],
    onCompleted: (data) => {
      setDbChats(data);
      setLoading(false);
    },
    skip: !sectorId,
  });

  useClientChatSubscription({
    sectorId: sectorId!,
    onChatCreated: (chat) => {
      setDbChats((prev) =>
        [...prev, chat].filter(
          (c, index, self) => index === self.findIndex((t) => t.id === c.id),
        ),
      );
    },
    onChatUpdated: (chat) => {
      setDbChats((prev) => prev.map((c) => (c.id === chat.id ? chat : c)));
    },
    onChatDeleted: (chat) => {
      setDbChats((prev) => prev.filter((c) => c.id !== chat.id));
      if (chat.status === ClientChatStatus.FINISHED) {
        enqueueInfoSnackBar({
          message: t`Chat ended`,
        });
      }
      if (openChat === chat.id) navigate(`/chat/call-center`);
    },
  });
  return {
    chats: dbChats,
    loading,
  };
};
