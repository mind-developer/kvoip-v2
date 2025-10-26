import { useClientChatMessageSubscription } from '@/chat/client-chat/hooks/useClientChatMessageSubscription';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ClientChatMessage } from 'twenty-shared/types';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useClientChatMessages = (chatId: string) => {
  const { locale } = useRecoilValue(dateLocaleState);
  const { timeZone, timeFormat } = useRecoilValue(dateTimeFormatState);
  const [dbMessages, setDbMessages] = useState<ClientChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  useFindManyRecords<ClientChatMessage & { __typename: string; id: string }>({
    objectNameSingular: 'clientChatMessage',
    filter: { clientChatId: { eq: chatId } },
    limit: 5000,
    orderBy: [{ createdAt: 'AscNullsFirst' }],
    onCompleted: (data) => {
      setDbMessages(
        data.map((message) => ({
          ...message,
          createdAt: formatInTimeZone(
            new Date(message.createdAt ?? ''),
            timeZone,
            timeFormat,
          ),
        })),
      );
      setLoading(false);
    },
    skip: !chatId,
  });

  useClientChatMessageSubscription({
    input: { chatId: chatId! },
    onMessageCreated: (message: ClientChatMessage) => {
      setDbMessages((prev) => [
        ...prev,
        {
          ...message,
          createdAt: formatInTimeZone(
            new Date(message.createdAt ?? ''),
            timeZone,
            timeFormat,
          ),
        },
      ]);
    },
    onMessageUpdated: (message: ClientChatMessage) => {
      setDbMessages((prev) =>
        prev.map((msg) =>
          msg.providerMessageId === message.providerMessageId
            ? {
                ...message,
                createdAt: formatInTimeZone(
                  new Date(message.createdAt ?? ''),
                  timeZone,
                  timeFormat,
                ),
              }
            : msg,
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
