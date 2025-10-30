import { gql } from '@apollo/client';

export const GET_WHATSAPP_TEMPLATES = gql`
  query GetWhatsappTemplates($input: GetWhatsappTemplatesInput!) {
    getWhatsappTemplates(input: $input) {
      templates {
        id
        status
        name
        language
        parameter_format
        category
        components {
          format
          text
          type
        }
      }
    }
  }
`;
