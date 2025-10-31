import { gql } from '@apollo/client';

export const GET_ALL_TELEPHONYS_PAGINATED = gql`
  query GetAllTelephonysPaginated(
    $workspaceId: ID!
    $page: Int!
    $limit: Int!
  ) {
    findAllTelephonyIntegrationPaginated(
      workspaceId: $workspaceId
      page: $page
      limit: $limit
    ) {
      data {
        id
        memberId
        numberExtension
        createdAt
        SIPPassword
        areaCode
        blockExtension
        callerExternalID
        destinyMailboxAllCallsOrOffline
        destinyMailboxBusy
        dialingPlan
        emailForMailbox
        enableMailbox
        extensionAllCallsOrOffline
        extensionBusy
        extensionGroup
        extensionName
        externalNumberAllCallsOrOffline
        externalNumberBusy
        fowardAllCalls
        fowardBusyNotAvailable
        fowardOfflineWithoutService
        listenToCalls
        pullCalls
        recordCalls
        type
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
        member {
          id
          name {
            firstName
            lastName
          }
          userEmail
          avatarUrl
          userId
          timeZone
          dateFormat
          timeFormat
          calendarStartDay
        }
      }
      pagination {
        currentPage
        totalPages
        totalItems
        itemsPerPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
