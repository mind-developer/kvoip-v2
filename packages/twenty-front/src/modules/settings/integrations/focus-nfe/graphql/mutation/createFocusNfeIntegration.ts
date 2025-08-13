import { gql } from '@apollo/client';

export const CREATE_FOCUS_NFE_INTEGRATION = gql`
  mutation CreateFocusNfeIntegration(
    $createInput: CreateFocusNfeIntegrationInput!
  ) {
    createFocusNfeIntegration(createInput: $createInput) {
      id
      status
      name
      cnpj
      cpf
      ie
      cnaeCode
      cep
      street
      number
      neighborhood
      city
      state
      taxRegime
    }
  }
`;
