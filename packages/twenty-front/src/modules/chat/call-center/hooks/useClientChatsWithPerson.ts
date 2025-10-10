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
  person: PersonRecord;
};

type PersonRecord = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  __typename: string;
};

export type ClientChatWithPerson = ClientChat & {
  person: PersonRecord;
};

export const useClientChatsWithPerson = () => {
  const [chats, setChats] = useState<ClientChatWithPerson[]>([]);

  const { records: chatRecords, loading: loadingChats } =
    useFindManyRecords<ClientChatRecord>({
      objectNameSingular: 'clientChat',
      recordGqlFields: {
        id: true,
        providerContactId: true,
        whatsappIntegrationId: true,
        messengerIntegrationId: true,
        telegramIntegrationId: true,
        agentId: true,
        sectorId: true,
        personId: true,
        status: true,
        person: {
          id: true,
          firstName: true,
          lastName: true,
        },
        sector: {
          id: true,
          name: true,
        },
      },
      orderBy: [
        {
          updatedAt: 'DescNullsLast',
        } as any,
      ],
    });

  useEffect(() => {
    if (chatRecords) {
      const mappedChats: ClientChatWithPerson[] = chatRecords.map((record) => {
        return {
          id: record.id,
          providerContactId: record.providerContactId,
          whatsappIntegrationId: record.whatsappIntegrationId,
          messengerIntegrationId: null,
          telegramIntegrationId: null,
          agentId: record.agentId,
          sectorId: record.sectorId,
          personId: record.personId,
          status: record.status as ClientChatStatus,
          person: record.person,
        };
      });
      setChats(mappedChats);
    }
  }, [chatRecords]);

  const handleNewChats = useCallback((data: any) => {
    const record = data.onDbEvent.record as ClientChatRecord;
    console.log('record', record);

    const newChat: ClientChatWithPerson = {
      id: record.id,
      providerContactId: record.providerContactId,
      whatsappIntegrationId: record.whatsappIntegrationId,
      messengerIntegrationId: null,
      telegramIntegrationId: null,
      agentId: record.agentId,
      sectorId: record.sectorId,
      personId: record.personId,
      status: record.status as ClientChatStatus,
      person: record.person,
    };

    setChats((prev) => {
      const existingChat = prev.find((chat) => chat.id === record.id);
      if (existingChat) return prev;
      return [newChat, ...prev];
    });
  }, []);

  const handleUpdatedChats = useCallback((data: any) => {
    const record = data.onDbEvent.record as ClientChatRecord;
    console.log('record', record);
    setChats((prev) => {
      return prev.map((chat) => {
        if (chat.id !== record.id) return chat;

        return {
          ...chat,
          providerContactId: record.providerContactId,
          whatsappIntegrationId: record.whatsappIntegrationId,
          agentId: record.agentId,
          sectorId: record.sectorId,
          personId: record.personId,
          status: record.status as ClientChatStatus,
        };
      });
    });
  }, []);

  const handleDeletedChats = useCallback((data: any) => {
    const record = data.onDbEvent.record as ClientChatRecord;
    console.log('record', record);
    setChats((prev) => {
      return prev.filter((chat) => chat.id !== record.id);
    });
  }, []);

  // Escutar eventos de criação
  useOnDbEvent({
    input: {
      objectNameSingular: 'clientChat',
      action: DatabaseEventAction.CREATED,
    },
    onData: handleNewChats,
  });

  // Escutar eventos de atualização
  useOnDbEvent({
    input: {
      objectNameSingular: 'clientChat',
      action: DatabaseEventAction.UPDATED,
    },
    onData: handleUpdatedChats,
  });

  // Escutar eventos de exclusão
  useOnDbEvent({
    input: {
      objectNameSingular: 'clientChat',
      action: DatabaseEventAction.DELETED,
    },
    onData: handleDeletedChats,
  });

  return {
    chats,
    loading: loadingChats,
  };
};
