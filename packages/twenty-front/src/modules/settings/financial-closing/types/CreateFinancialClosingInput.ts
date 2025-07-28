export interface CreateFinancialClosingInput {
  name: string;
  lastDayMonth: boolean;
  time: string;
  day: number;
  billingModelIds: string[];
  workspaceId: string;
}
