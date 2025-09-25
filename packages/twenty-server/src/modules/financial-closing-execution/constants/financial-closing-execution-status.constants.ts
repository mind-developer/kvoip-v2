import { TagColor } from "src/engine/metadata-modules/field-metadata/dtos/options.input";

export enum FinancialClosingExecutionStatusEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

type FinancialClosingExecutionMetadata = {
  label: string;
  color: TagColor;
  position: number;
};

export const FINANCIAL_CLOSING_EXECUTION_MODEL_METADATA: Record<FinancialClosingExecutionStatusEnum, FinancialClosingExecutionMetadata> = {
  [FinancialClosingExecutionStatusEnum.SUCCESS]: {
    label: 'Sucesso',
    color: 'green',
    position: 0,
  },
  [FinancialClosingExecutionStatusEnum.ERROR]: {
    label: 'Erro',
    color: 'red',
    position: 1,
  },
  [FinancialClosingExecutionStatusEnum.PENDING]: {
    label: 'Pendente',
    color: 'yellow',
    position: 2,
  }
};

export const FINANCIAL_CLOSING_EXECUTION_MODEL_OPTIONS = Object.entries(FINANCIAL_CLOSING_EXECUTION_MODEL_METADATA).map(
  ([value, { label, color, position }]) => ({
    value,
    label,
    color,
    position,
  }),
);

// Utilitário: Pega o label pelo valor
export function getBillingModelLabel(value: FinancialClosingExecutionStatusEnum | string): string {
  return FINANCIAL_CLOSING_EXECUTION_MODEL_METADATA[value as FinancialClosingExecutionStatusEnum]?.label ?? value;
}
