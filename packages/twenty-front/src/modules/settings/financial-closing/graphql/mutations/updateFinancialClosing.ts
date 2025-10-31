/* @kvoip-woulz proprietary */
import { gql } from '@apollo/client';

export const UPDATE_FINANCIAL_CLOSING = gql`
  mutation UpdateFinancialClosing($updateInput: UpdateFinancialClosingInput!) {
    updateFinancialClosing(updateInput: $updateInput) {
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
