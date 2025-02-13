import { gql } from '@apollo/client';

export const REMOVE_INTER_INTEGRATION = gql`
  mutation removeInterIntegration($id: String!) {
    removeInterIntegration(id: $id)
  }
`;
