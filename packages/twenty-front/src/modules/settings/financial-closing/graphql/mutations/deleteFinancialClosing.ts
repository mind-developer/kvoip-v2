/* @kvoip-woulz proprietary */
import { gql } from '@apollo/client';

export const DELETE_FINANCIAL_CLOSING_BY_ID = gql`
  mutation DeleteFinancialClosing($financialClosingId: String!) {
    deleteFinancialClosing(financialClosingId: $financialClosingId)
  }
`;
