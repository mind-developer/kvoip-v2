import { gql } from '@apollo/client';

export const DELETE_TELEPHONY = gql`
  mutation DeleteTelephony($id: ID!) {
    deleteTelephonyIntegration(id: $id)
  }
`;
