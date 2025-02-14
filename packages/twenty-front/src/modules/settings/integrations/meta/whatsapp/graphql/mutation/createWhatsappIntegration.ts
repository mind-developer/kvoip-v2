import { gql } from '@apollo/client';

export const CREATE_WHATSAPP_INTEGRATION = gql`
  mutation CreateWhatsappIntegration(
    $createInput: CreateWhatsappIntegrationInput!
  ) {
    createWhatsappIntegration(createInput: $createInput) {
      id
      label
      phoneId
      businessAccountId
      accessToken
      appId
      appKey
      disabled
      workspace {
        id
      }
    }
  }
`;
