/* @kvoip-woulz proprietary */
import { gql } from '@apollo/client';

export const GET_ALL_FINANCIAL_CLOSINGS = gql`
  query FinancialClosingsByWorkspace($workspaceId: String!) {
    financialClosingsByWorkspace(workspaceId: $workspaceId) {
      id
      name
      day
      lastDayMonth
      time
      billingModelIds
      workspace {
        id
        displayName
      }
      createdAt
      updatedAt
    }
  }
`;
