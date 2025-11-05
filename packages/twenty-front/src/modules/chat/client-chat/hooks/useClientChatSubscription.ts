import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { createClient } from 'graphql-sse';
import { useEffect, useMemo } from 'react';
import { type ClientChat } from 'twenty-shared/types';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ON_CLIENT_CHAT_EVENT } from '../graphql/subscriptions/onClientChatEvent';

// Enum local para eventos de chat
enum ClientChatEvent {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

type UseClientChatSubscriptionArgs = {
  sectorId: string;
  onChatCreated?: (chat: ClientChat) => void;
  onChatUpdated?: (chat: ClientChat) => void;
  onChatDeleted?: (chat: ClientChat) => void;
  onError?: (error: any) => void;
  skip?: boolean;
};

export const useClientChatSubscription = ({
  sectorId,
  onChatCreated,
  onChatUpdated,
  onChatDeleted,
  onError,
  skip = false,
}: UseClientChatSubscriptionArgs) => {
  const tokenPair = getTokenPair();

  const sseClient = useMemo(() => {
    const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

    return createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'X-Accel-Buffering': 'no',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }, [tokenPair?.accessOrWorkspaceAgnosticToken?.token]);

  const handleData = (data: any) => {
    try {
      const { event, clientChat } = data.onClientChatEvent;

      switch (event) {
        case ClientChatEvent.CREATED:
          onChatCreated?.(clientChat);
          break;
        case ClientChatEvent.UPDATED:
          onChatUpdated?.(clientChat);
          break;
        case ClientChatEvent.DELETED:
          onChatDeleted?.(clientChat);
          break;
        default:
          console.log('Untreated event:', event);
      }
    } catch (error) {
      console.error('Error onClientChatEvent', error);
      onError?.(error);
    }
  };

  useEffect(() => {
    if (skip) {
      return;
    }
    const next = (value: { data: any }) => handleData(value.data);
    const error = (err: unknown) => console.error('error', err);
    const complete = () => {};
    const unsubscribe = sseClient.subscribe(
      {
        query: ON_CLIENT_CHAT_EVENT.loc?.source.body || '',
        variables: { input: { sectorId } },
      },
      {
        next,
        error,
        complete,
      },
    );

    return () => {
      unsubscribe();
    };
  }, [sectorId, handleData, onError, skip, sseClient]);
};
