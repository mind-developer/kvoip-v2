import { type CreateFinancialClosingInput } from '@/settings/financial-closing/types/CreateFinancialClosingInput';

export interface UpdateFinancialClosingInput
  extends CreateFinancialClosingInput {
  id: string;
}
