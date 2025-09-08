export interface CompanyFinancialClosingExecution {
  __typename: 'CompanyFinancialClosingExecution';
  id: string;
  name: string;
  executedAt: string;
  status: string;
  completedBoletoIssuance: boolean;
  completedInvoiceIssuance: boolean;
  calculatedChargeValue: boolean;
  invoiceEmissionType: string | null;
  chargeValue: number;
  company?: {
    id: string;
    name: string;
  };
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