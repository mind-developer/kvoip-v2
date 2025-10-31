import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { createClient } from 'graphql-sse';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type ClientChatMessage } from 'twenty-shared/types';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ON_CLIENT_MESSAGE_EVENT } from '../graphql/subscriptions/onClientMessageEvent';

// Enum local para eventos de mensagem
enum ClientMessageEvent {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

type OnChatMessageEventInput = {
  chatId: string;
};

type UseClientChatMessageSubscriptionArgs = {
  input: OnChatMessageEventInput;
  onMessageCreated?: (message: ClientChatMessage) => void;
  onMessageUpdated?: (message: ClientChatMessage) => void;
  onError?: (error: any) => void;
  skip?: boolean;
};

export const useClientChatMessageSubscription = ({
  input,
  onMessageCreated,
  onMessageUpdated,
  onError,
  skip = false,
}: UseClientChatMessageSubscriptionArgs) => {
  const tokenPair = getTokenPair();

  // Use refs to store the latest callback functions
  const onMessageCreatedRef = useRef(onMessageCreated);
  const onMessageUpdatedRef = useRef(onMessageUpdated);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageCreatedRef.current = onMessageCreated;
  }, [onMessageCreated]);

  useEffect(() => {
    onMessageUpdatedRef.current = onMessageUpdated;
  }, [onMessageUpdated]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const sseClient = useMemo(() => {
    const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

    const client = createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    return client;
  }, [tokenPair?.accessOrWorkspaceAgnosticToken?.token]);

  const handleData = useCallback((data: any) => {
    if (!data) {
      return;
    }

    // The actual structure is data.data.onClientMessageEvent.clientChatMessage
    const subscriptionData = data.data;

    if (!subscriptionData.onClientMessageEvent.clientChatMessage) {
      return;
    }

    const { clientChatMessage } = subscriptionData.onClientMessageEvent;

    switch (subscriptionData.onClientMessageEvent.event) {
      case ClientMessageEvent.CREATED:
        onMessageCreatedRef.current?.(
          subscriptionData.onClientMessageEvent.clientChatMessage,
        );
        break;
      case ClientMessageEvent.UPDATED:
        onMessageUpdatedRef.current?.(
          subscriptionData.onClientMessageEvent.clientChatMessage,
        );
        break;
      default:
        console.log(
          'Untreated event:',
          subscriptionData.onClientMessageEvent.event,
        );
    }
  }, []);

  const handleError = useCallback((error: any) => {
    onErrorRef.current?.(error) || console.error('Error onClientMessageEvent');
  }, []);

  useEffect(() => {
    if (skip || !input.chatId) {
      console.log(
        'Skipping subscription - skip:',
        skip,
        'chatId:',
        input.chatId,
      );
      return;
    }

    const unsubscribe = sseClient.subscribe(
      {
        query: ON_CLIENT_MESSAGE_EVENT.loc?.source.body || '',
        variables: { input: { chatId: input.chatId } },
      },
      {
        next: (data) => {
          handleData(data);
        },
        error: (error) => {
          console.error('Subscription error:', error);
          handleError(error);
        },
        complete: () => {},
      },
    );

    return () => {
      unsubscribe();
    };
  }, [input.chatId, handleData, handleError, skip, sseClient]);
};
