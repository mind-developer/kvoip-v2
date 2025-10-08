import { gql } from '@apollo/client';

export const LINK_MEMBER_TO_EXTENSION = gql`
  mutation LinkMemberToExtension($extensionId: String!, $memberId: ID!) {
    linkMemberToExtension(extensionId: $extensionId, memberId: $memberId) {
      id
      memberId
      extensionId
      numberExtension
      extensionName
    }
  }
`;
