import { gql } from '@apollo/client';

export const GET_ALL_INTER_INTEGRATIONS = gql`
  query InterIntegrationsByWorkspace($workspaceId: String!) {
    interIntegrationsByWorkspace(workspaceId: $workspaceId) {
      id
      integrationName
      clientId
      clientSecret
      currentAccount
      privateKey
      certificate
      status
      expirationDate
      workspace {
        id
      }
    }
  }
`;
