export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export enum FinancialClosingExecutionStatus {
  Success = 'SUCCESS',
  Error = 'ERROR',
  Pending = 'PENDING',
}

export const FinancialClosingExecutionStatusOptions: SelectOption<FinancialClosingExecutionStatus>[] = [
  { label: 'Sucesso', value: FinancialClosingExecutionStatus.Success },
  { label: 'Erro', value: FinancialClosingExecutionStatus.Error },
  { label: 'Pendente', value: FinancialClosingExecutionStatus.Pending },
];

const statusLabelMap = new Map(
  FinancialClosingExecutionStatusOptions.map(option => [option.value, option.label])
);

export function getFinancialClosingExecutionStatusLabel(value: FinancialClosingExecutionStatus | string): string {
  return statusLabelMap.get(value as FinancialClosingExecutionStatus) || value;
}

export function getFinancialClosingExecutionStatusColor(status: string): 'green' | 'red' | 'blue' | 'yellow' | 'gray' {
  switch (status?.toUpperCase()) {
    case FinancialClosingExecutionStatus.Success:
      return 'green';
    case FinancialClosingExecutionStatus.Error:
      return 'red';
    case FinancialClosingExecutionStatus.Pending:
      return 'yellow';
    default:
      return 'gray';
  }
}
