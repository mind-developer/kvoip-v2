import { gql } from '@apollo/client';

export const UPDATE_TELEPHONY = gql`
  mutation UpdateTelephony(
    $id: ID!
    $updateTelephonyInput: UpdateTelephonyInput!
  ) {
    updateTelephonyIntegration(
      id: $id
      updateTelephonyInput: $updateTelephonyInput
    ) {
      id
      memberId
      numberExtension
    }
  }
`;
