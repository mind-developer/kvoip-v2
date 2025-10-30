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
  financialClosingExecution?: {
    id: string;
    name: string;
    financialClosingId: string;
  };
  charge?: {
    id: string;
  };
  invoices?: {
    id: string;
    nfStatus: string;
    nfType: string;
  }[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  logs: log[] | null;
  financialClosingExecutionId: string;
}

interface log {
  level: string;
  message: string;
  timestamp: string;
}
