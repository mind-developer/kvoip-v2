import { gql } from '@apollo/client';

export const UPDATE_FINANCIAL_CLOSING = gql`
  mutation UpdateFinancialClosing($updateFinancialClosing: UpdateFinancialClosing!) {
    updateFinancialClosing(updateFinancialClosing: $updateFinancialClosing) {
      id
      name
      day
      lastDayMonth
      time
      workspace {
        id
        displayName
      }
    }
  }
`;
