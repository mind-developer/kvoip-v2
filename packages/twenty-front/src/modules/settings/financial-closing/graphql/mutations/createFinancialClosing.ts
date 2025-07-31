import { gql } from '@apollo/client';

// export const CREATE_FINANCIAL_CLOSING = gql`
//   mutation CreateFinancialClosing($createInput: CreateFinancialClosing!) {
//     createFinancialClosing(createInput: $createInput) {
//       id
//     }
//   }
// `;

export const CREATE_FINANCIAL_CLOSING = gql`
  mutation CreateFinancialClosing($createInput: CreateFinancialClosingInput!) {
    createFinancialClosing(createInput: $createInput) {
      id
    }
  }
`;