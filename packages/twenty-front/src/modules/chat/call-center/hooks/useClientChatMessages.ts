import { useClientChatMessageSubscription } from '@/chat/call-center/hooks/useClientChatMessageSubscription';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useEffect, useState } from 'react';
import { ClientChatMessage } from 'twenty-shared/types';

export const useClientChatMessages = (chatId: string) => {
  const [dbMessages, setDbMessages] = useState<ClientChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  useFindManyRecords<ClientChatMessage & { __typename: string; id: string }>({
    objectNameSingular: 'clientChatMessage',
    filter: { clientChatId: { eq: chatId } },
    limit: 5000,
    orderBy: [{ createdAt: 'AscNullsFirst' }],
    onCompleted: (data) => {
      setDbMessages(data);
      setLoading(false);
    },
    skip: !chatId,
  });

  useEffect(() => {
    setDbMessages([]);
  }, [chatId]);

  useClientChatMessageSubscription({
    input: { chatId: chatId! },
    onMessageCreated: (message: ClientChatMessage) => {
      setDbMessages((prev) => [...prev, message]);
    },
    onMessageUpdated: (message: ClientChatMessage) => {
      setDbMessages((prev) =>
        prev.map((msg) =>
          msg.providerMessageId === message.providerMessageId ? message : msg,
        ),
      );
    },
    skip: !chatId,
  });
  return {
    messages: dbMessages,
    loading,
  };
};
