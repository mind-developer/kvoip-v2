export interface CreateFinancialClosingInput {
  name: string;
  last_day_month: boolean;
  time: string;
  day: number;
  billingModelIds: string[];
  workspaceId: string;
}
