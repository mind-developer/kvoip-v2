import { gql } from '@apollo/client';

export const SEND_WHATSAPP_TEMPLATE = gql`
  mutation SendWhatsAppTemplate(
    $sendWhatsAppTemplateInput: SendWhatsAppTemplateInput!
  ) {
    sendWhatsAppTemplate(sendWhatsAppTemplateInput: $sendWhatsAppTemplateInput)
  }
`;
