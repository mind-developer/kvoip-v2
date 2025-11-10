import { gql } from '@apollo/client';

export const SEND_WHATSAPP_EVENT_MESSAGE = gql`
  mutation SendWhatsAppEventMessage(
    $sendWhatsAppEventMessageInput: SendWhatsAppEventMessageInput!
  ) {
    sendWhatsAppEventMessage(
      sendWhatsAppEventMessageInput: $sendWhatsAppEventMessageInput
    )
  }
`;
