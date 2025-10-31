import { gql } from '@apollo/client';

export const GET_TELEPHONY_BY_MEMBER = gql`
  query getTelephonyByMember($workspaceId: ID!, $memberId: ID!) {
    getTelephonyByMember(workspaceId: $workspaceId, memberId: $memberId) {
      id
      memberId
      numberExtension
      extensionName
      type
      SIPPassword
      callerExternalID
      dialingPlan
      areaCode
      pullCalls
      listenToCalls
      recordCalls
      blockExtension
      enableMailbox
      emailForMailbox
      fowardAllCalls
      fowardBusyNotAvailable
      fowardOfflineWithoutService
      extensionAllCallsOrOffline
      externalNumberAllCallsOrOffline
      destinyMailboxAllCallsOrOffline
      extensionBusy
      externalNumberBusy
      destinyMailboxBusy
      ramal_id
      advancedFowarding1
      advancedFowarding2
      advancedFowarding3
      advancedFowarding4
      advancedFowarding5
      advancedFowarding1Value
      advancedFowarding2Value
      advancedFowarding3Value
      advancedFowarding4Value
      advancedFowarding5Value
      createdAt
      updatedAt
    }
  }
`;
