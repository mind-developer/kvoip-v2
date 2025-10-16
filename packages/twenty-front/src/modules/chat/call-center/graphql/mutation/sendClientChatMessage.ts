import { gql } from '@apollo/client';

export const SEND_CLIENT_CHAT_MESSAGE = gql`
  mutation SendClientChatMessage($input: SendClientChatMessageInput!) {
    sendClientChatMessage(input: $input) {
      messageId
    }
  }
`;
