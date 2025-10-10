import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';
import { useCallback, useEffect, useState } from 'react';
import { ClientChat, ClientChatStatus } from 'twenty-shared/types';
import { DatabaseEventAction } from '~/generated/graphql';

type ClientChatRecord = {
  id: string;
  providerContactId: string;
  whatsappIntegrationId: string | null;
  agentId: string | null;
  sectorId: string | null;
  personId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __typename: string;
};

export const useClientChats = () => {
  const [chats, setChats] = useState<ClientChat[]>([]);

  const { records: chatRecords, loading } =
    useFindManyRecords<ClientChatRecord>({
      objectNameSingular: 'clientChat',
      orderBy: [
        {
          updatedAt: 'DescNullsLast',
        } as any,
      ],
    });

  useEffect(() => {
    if (chatRecords) {
      const mappedChats: ClientChat[] = chatRecords.map((record) => ({
        id: record.id,
        providerContactId: record.providerContactId,
        whatsappIntegrationId: record.whatsappIntegrationId,
        messengerIntegrationId: null,
        telegramIntegrationId: null,
        agentId: record.agentId,
        sectorId: record.sectorId,
        personId: record.personId,
        status: record.status as ClientChatStatus,
      }));
      setChats(mappedChats);
    }
  }, [chatRecords]);

  const handleNewChat = useCallback((data: any) => {
    const record = data.onDbEvent.record as ClientChatRecord;

    const newChat: ClientChat = {
      id: record.id,
      providerContactId: record.providerContactId,
      whatsappIntegrationId: record.whatsappIntegrationId,
      messengerIntegrationId: null,
      telegramIntegrationId: null,
      agentId: record.agentId,
      sectorId: record.sectorId,
      personId: record.personId,
      status: record.status as ClientChatStatus,
    };

    setChats((prev) => {
      const exists = prev.some((chat) => chat.id === record.id);
      if (exists) return prev;
      return [newChat, ...prev];
    });
  }, []);

  const handleUpdatedChat = useCallback((data: any) => {
    const record = data.onDbEvent.record as ClientChatRecord;

    const updatedChat: ClientChat = {
      id: record.id,
      providerContactId: record.providerContactId,
      whatsappIntegrationId: record.whatsappIntegrationId,
      messengerIntegrationId: null,
      telegramIntegrationId: null,
      agentId: record.agentId,
      sectorId: record.sectorId,
      personId: record.personId,
      status: record.status as ClientChatStatus,
    };

    setChats((prev) =>
      prev.map((chat) => (chat.id === record.id ? updatedChat : chat)),
    );
  }, []);

  const handleDeletedChat = useCallback((data: any) => {
    const record = data.onDbEvent.record as ClientChatRecord;

    setChats((prev) => prev.filter((chat) => chat.id !== record.id));
  }, []);

  // Escutar eventos de criação
  useOnDbEvent({
    input: {
      objectNameSingular: 'clientChat',
      action: DatabaseEventAction.CREATED,
    },
    onData: handleNewChat,
  });

  // Escutar eventos de atualização
  useOnDbEvent({
    input: {
      objectNameSingular: 'clientChat',
      action: DatabaseEventAction.UPDATED,
    },
    onData: handleUpdatedChat,
  });

  // Escutar eventos de exclusão
  useOnDbEvent({
    input: {
      objectNameSingular: 'clientChat',
      action: DatabaseEventAction.DELETED,
    },
    onData: handleDeletedChat,
  });

  return {
    chats,
    loading,
  };
};
