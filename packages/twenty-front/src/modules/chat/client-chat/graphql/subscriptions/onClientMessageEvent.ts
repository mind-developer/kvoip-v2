import { gql } from '@apollo/client';

export const ON_CLIENT_MESSAGE_EVENT = gql`
  subscription OnClientMessageEvent($input: OnChatMessageEventInput!) {
    onClientMessageEvent(input: $input) {
      event
      clientChatMessageEventDate
      clientChatMessage
    }
  }
`;
