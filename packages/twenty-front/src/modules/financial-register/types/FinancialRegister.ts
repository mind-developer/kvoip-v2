/* @kvoip-woulz proprietary */
export type FinancialRegister = {
  __typename: 'FinancialRegister';
  id: string;
  registerType: 'receivable' | 'payable';
  status: string;
  amount: {
    __typename?: 'Currency';
    amountMicros: number;
    currencyCode: string;
  };
  dueDate: string;
  cpfCnpj: string | null;
  pixKey: string | null;

  // Receivable-specific
  documentNumber: string | null;
  isRecharge: boolean | null;
  bankSlipLink: string | null;

  // Payable-specific
  paymentType: string | null;
  barcode: string | null;
  paymentDate: string | null;
  message: string | null;

  position: number | null;
};
