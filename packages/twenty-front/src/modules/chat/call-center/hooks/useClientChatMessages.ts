import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';
import { useCallback, useEffect, useState } from 'react';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageType,
  ClientChatMessage,
  ClientChatMessageEvent,
  ClientChatMessageFromType,
  ClientChatMessageToType,
} from 'twenty-shared/types';
import { DatabaseEventAction } from '~/generated/graphql';

type ClientChatMessageRecord = {
  id: string;
  clientChatId: string;
  from: string;
  fromType: ClientChatMessageFromType;
  to: string;
  toType: ClientChatMessageToType;
  provider: ChatIntegrationProvider;
  providerMessageId: string;
  type: ChatMessageType;
  textBody: string | null;
  caption: string | null;
  deliveryStatus: ChatMessageDeliveryStatus;
  edited: boolean | null;
  attachmentUrl: string | null;
  event: ClientChatMessageEvent | null;
  createdAt: string;
  updatedAt: string;
  __typename: string;
};

const mapRecordToClientChatMessage = (
  record: ClientChatMessageRecord,
): ClientChatMessage => {
  return {
    clientChatId: record.clientChatId,
    from: record.from,
    fromType: record.fromType,
    to: record.to,
    toType: record.toType,
    provider: record.provider,
    providerMessageId: record.providerMessageId,
    type: record.type,
    textBody: record.textBody,
    caption: record.caption,
    deliveryStatus: record.deliveryStatus,
    edited: record.edited,
    attachmentUrl: record.attachmentUrl,
    event: record.event,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

type ClientChatRecord = {
  id: string;
  whatsappIntegrationId: string | null;
  providerContactId: string;
  agentId: string | null;
  sectorId: string | null;
  personId: string;
  status: string;
  __typename: string;
};

export const useClientChatMessages = (chatId: string) => {
  const [messages, setMessages] = useState<ClientChatMessage[]>([]);

  // Buscar o chat pelo integrationId e providerContactId
  const { records: chats, loading: loadingChat } =
    useFindManyRecords<ClientChatRecord>({
      objectNameSingular: 'clientChat',
      filter: chatId ? { id: { eq: chatId } } : undefined,
      skip: !chatId,
    });

  const chat = chats?.[0];

  // Buscar mensagens do chat
  const { records: chatMessages, loading: loadingMessages } =
    useFindManyRecords<ClientChatMessageRecord>({
      objectNameSingular: 'clientChatMessage',
      filter: chatId
        ? {
            clientChatId: {
              eq: chatId,
            },
          }
        : undefined,
      orderBy: [
        {
          createdAt: 'AscNullsFirst',
        } as any,
      ],
      skip: !chatId,
    });

  // Atualizar messages quando chatMessages mudar
  useEffect(() => {
    if (chatMessages) {
      const mappedMessages = chatMessages.map(mapRecordToClientChatMessage);
      setMessages(mappedMessages);
    }
  }, [chatMessages]);

  // Função para adicionar nova mensagem
  const handleNewMessage = useCallback(
    (data: any) => {
      const record = data.onDbEvent.record as ClientChatMessageRecord;

      // Verificar se a mensagem pertence ao chat atual
      if (record.clientChatId !== chatId) return;

      const newMessage = mapRecordToClientChatMessage(record);

      setMessages((prev) => {
        // Verificar se a mensagem já existe (evitar duplicatas)
        const exists = prev.some(
          (msg) => msg.providerMessageId === newMessage.providerMessageId,
        );
        if (exists) return prev;

        return [...prev, newMessage];
      });
    },
    [chatId],
  );

  // Função para atualizar mensagem existente
  const handleUpdatedMessage = useCallback(
    (data: any) => {
      const record = data.onDbEvent.record as ClientChatMessageRecord;

      // Verificar se a mensagem pertence ao chat atual
      if (record.clientChatId !== chatId) return;

      const updatedMessage = mapRecordToClientChatMessage(record);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.providerMessageId === updatedMessage.providerMessageId
            ? updatedMessage
            : msg,
        ),
      );
    },
    [chatId],
  );

  // Escutar criação de novas mensagens
  useOnDbEvent({
    input: {
      objectNameSingular: 'clientChatMessage',
      action: DatabaseEventAction.CREATED,
    },
    onData: handleNewMessage,
    skip: !chatId,
  });

  // Escutar atualizações de mensagens
  useOnDbEvent({
    input: {
      objectNameSingular: 'clientChatMessage',
      action: DatabaseEventAction.UPDATED,
    },
    onData: handleUpdatedMessage,
    skip: !chatId,
  });

  return {
    messages,
    loading: loadingChat || loadingMessages,
    chatId,
  };
};
