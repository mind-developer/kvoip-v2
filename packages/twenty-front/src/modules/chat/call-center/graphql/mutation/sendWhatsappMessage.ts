import { gql } from '@apollo/client';

export const SEND_WHATSAPP_MESSAGE = gql`
  mutation SendWhatsAppMessage(
    $sendWhatsAppMessageInput: SendWhatsAppMessageInput!
  ) {
    sendWhatsAppMessage(sendWhatsAppMessageInput: $sendWhatsAppMessageInput)
  }
`;
