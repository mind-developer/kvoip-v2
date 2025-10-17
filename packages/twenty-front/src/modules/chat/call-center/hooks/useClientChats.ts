import { useClientChatSubscription } from '@/chat/call-center/hooks/useClientChatSubscription';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientChat } from 'twenty-shared/types';

export const useClientChats = (sectorId: string) => {
  const [dbChats, setDbChats] = useState<ClientChat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    },
    filter: { sectorId: { eq: sectorId } },
    limit: 5000,
    orderBy: [{ createdAt: 'AscNullsFirst' }],
    onCompleted: (data) => {
      setDbChats(data);
      setLoading(false);
    },
    skip: !sectorId,
  });

  useEffect(() => {
    setDbChats([]);
  }, [sectorId]);

  useClientChatSubscription({
    sectorId: sectorId!,
    onChatCreated: (chat) => {
      setDbChats((prev) => [...prev, chat]);
    },
    onChatUpdated: (chat) => {
      setDbChats((prev) => prev.map((c) => (c.id === chat.id ? chat : c)));
    },
    onChatDeleted: (chat) => {
      setDbChats((prev) => prev.filter((c) => c.id !== chat.id));
      navigate(`/chat/call-center`);
    },
  });
  return {
    chats: dbChats,
    loading,
  };
};
