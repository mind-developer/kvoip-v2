import { gql } from '@apollo/client';

export const LINK_MEMBER_TO_EXTENSION = gql`
  mutation LinkMemberToExtension($numberExtension: String!, $memberId: ID!) {
    linkMemberToExtension(numberExtension: $numberExtension, memberId: $memberId) {
      id
      memberId
      ramal_id
      numberExtension
      extensionName
    }
  }
`;
