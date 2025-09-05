import { gql } from '@apollo/client';

export const GET_FINANCIAL_CLOSING_EXECUTIONS = gql`
  query FinancialClosingExecutionsByClosing($financialClosingId: String!) {
    financialClosingExecutionsByClosing(financialClosingId: $financialClosingId) {
      id
      name
      executedAt
      financialClosingId
      status
      companiesTotal
      companiesWithError
      completedCompanySearch
      completedCostIdentification
      completedBoletoIssuance
      completedInvoiceIssuance
      billingModelIds
      createdAt
      updatedAt
      deletedAt
      logs {
        level
        message
        timestamp
      }
    }
  }
`;
