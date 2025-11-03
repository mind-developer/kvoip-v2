import { gql } from '@apollo/client';

export const ON_CLIENT_CHAT_EVENT = gql`
  subscription OnClientChatEvent($input: OnChatEventInput!) {
    onClientChatEvent(input: $input) {
      event
      clientChatEventDate
      clientChat
    }
  }
`;
