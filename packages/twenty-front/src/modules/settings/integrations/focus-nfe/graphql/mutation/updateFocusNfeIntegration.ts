import { gql } from '@apollo/client';

export const UPDATE_FOCUS_NFE_INTEGRATION = gql`
  mutation UpdateFocusNfeIntegration(
    $updateInput: UpdateFocusNfeIntegrationInput!
  ) {
    updateFocusNfeIntegration(updateInput: $updateInput) {
      id
      status
      name
      cnpj
      cpf
      ie
      inscricaoMunicipal
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
