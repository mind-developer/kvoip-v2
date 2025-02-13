import { gql } from '@apollo/client';

export const GET_ALL_INTER_INTEGRATIONS = gql`
  query GetAllInterIntegrations($workspaceId: String!) {
    getAllInterIntegrations(workspaceId: $workspaceId) {
      clientId
      workspaceId {
        id
      }
    }
  }
`;
