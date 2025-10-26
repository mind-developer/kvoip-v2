import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { createClient } from 'graphql-sse';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ClientChat } from 'twenty-shared/types';
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

  // Use refs to store the latest callback functions
  const onChatCreatedRef = useRef(onChatCreated);
  const onChatUpdatedRef = useRef(onChatUpdated);
  const onChatDeletedRef = useRef(onChatDeleted);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onChatCreatedRef.current = onChatCreated;
  }, [onChatCreated]);

  useEffect(() => {
    onChatUpdatedRef.current = onChatUpdated;
  }, [onChatUpdated]);

  useEffect(() => {
    onChatDeletedRef.current = onChatDeleted;
  }, [onChatDeleted]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const sseClient = useMemo(() => {
    const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

    return createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }, [tokenPair?.accessOrWorkspaceAgnosticToken?.token]);

  const handleData = useCallback((data: any) => {
    const { event, clientChat } = data.onClientChatEvent;

    switch (event) {
      case ClientChatEvent.CREATED:
        onChatCreatedRef.current?.(clientChat);
        break;
      case ClientChatEvent.UPDATED:
        onChatUpdatedRef.current?.(clientChat);
        break;
      case ClientChatEvent.DELETED:
        onChatDeletedRef.current?.(clientChat);
        break;
    }
  }, []);

  const handleError = useCallback((error: any) => {
    onErrorRef.current?.(error) || console.error('Error onClientChatEvent');
  }, []);

  useEffect(() => {
    if (skip) {
      return;
    }
    const next = (value: { data: any }) => handleData(value.data);
    const error = (err: unknown) => handleError(err);
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
  }, [sectorId, handleData, handleError, skip, sseClient]);
};
