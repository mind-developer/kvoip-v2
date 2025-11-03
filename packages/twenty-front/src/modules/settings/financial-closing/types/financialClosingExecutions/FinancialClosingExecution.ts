/* @kvoip-woulz proprietary */
export interface FinancialClosingExecution {
  __typename: 'FinancialClosingExecution';
  id: string;
  name: string;
  executedAt: string;
  financialClosingId: string;
  status: string;
  companiesTotal: number;
  companiesWithError: number;
  completedCompanySearch: boolean;
  completedCostIdentification: boolean;
  completedBoletoIssuance: boolean;
  completedInvoiceIssuance: boolean;
  billingModelIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  logs: log[] | null;
}

interface log {
  level: string;
  message: string;
  timestamp: string;
}
