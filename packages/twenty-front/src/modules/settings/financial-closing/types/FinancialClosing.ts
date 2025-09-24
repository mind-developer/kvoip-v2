export interface FinancialClosing {
  id: string;
  name: string;
  lastDayMonth: boolean;
  time: string;
  day?: number;
  billingModelIds?: string[];
  workspace: {
    id: string;
    displayName: string;
  };
}
