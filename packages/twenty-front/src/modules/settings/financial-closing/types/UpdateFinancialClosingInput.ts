import { CreateFinancialClosingInput } from '@/settings/service-center/sectors/types/CreateFinancialClosingInput';

export interface UpdateFinancialClosingInput extends CreateFinancialClosingInput {
  id: string;
}
