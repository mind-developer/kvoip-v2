/* @kvoip-woulz proprietary */
import { useClientChatMessageSubscription } from '@/chat/client-chat/hooks/useClientChatMessageSubscription';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { differenceInHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { type ClientChatMessage } from 'twenty-shared/types';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useClientChatMessages = (chatId: string) => {
  const { locale } = useRecoilValue(dateLocaleState);
  const { timeZone, timeFormat, dateFormat } = useRecoilValue(dateTimeFormatState);
  const [dbMessages, setDbMessages] = useState<ClientChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const formatMessageDateTime = (messageDate: Date | string): string => {
    const date = new Date(messageDate);
    const now = new Date();
    const hoursDiff = Math.abs(differenceInHours(now, date));
    
    if (hoursDiff >= 24) {
      return formatInTimeZone(date, timeZone, `${dateFormat} ${timeFormat}`);
    }
    
    return formatInTimeZone(date, timeZone, timeFormat);
  };
  useFindManyRecords<ClientChatMessage & { __typename: string; id: string }>({
    objectNameSingular: 'clientChatMessage',
    filter: { clientChatId: { eq: chatId } },
    limit: 1000,
    orderBy: [{ createdAt: 'AscNullsFirst' }],
    onCompleted: (data) => {
      setDbMessages(
        data.map((message) => ({
          ...message,
          createdAt: formatMessageDateTime(message.createdAt ?? ''),
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
          createdAt: formatMessageDateTime(
            message.createdAt?.replace(' ', 'T').replace(' ', '') ?? '',
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
                createdAt: formatMessageDateTime(message.createdAt ?? ''),
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
