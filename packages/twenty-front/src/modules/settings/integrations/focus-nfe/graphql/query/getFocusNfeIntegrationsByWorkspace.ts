import gql from 'graphql-tag';

export const GET_FOCUS_NFE_INTEGRATIONS_BY_WORKSPACE = gql`
  query GetFocusNfeIntegrationsByWorkspace {
    getFocusNfeIntegrationsByWorkspace {
      id
      status
      name
      token
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
