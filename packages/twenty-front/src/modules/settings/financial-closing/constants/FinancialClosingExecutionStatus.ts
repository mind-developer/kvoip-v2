import { useLingui } from '@lingui/react/macro';

export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export enum FinancialClosingExecutionStatus {
  Success = 'SUCCESS',
  Error = 'ERROR',
  Pending = 'PENDING',
}

// Hook para traduções do FinancialClosingExecutionStatus
export const useFinancialClosingExecutionStatusTranslations = () => {
  const { t } = useLingui();

  const getFinancialClosingExecutionStatusLabel = (
    value: FinancialClosingExecutionStatus | string,
  ): string => {
    switch (value) {
      case FinancialClosingExecutionStatus.Success:
        return t`Success`;
      case FinancialClosingExecutionStatus.Error:
        return t`Error`;
      case FinancialClosingExecutionStatus.Pending:
        return t`Pending`;
      default:
        return value as string;
    }
  };

  const getFinancialClosingExecutionStatusOptions =
    (): SelectOption<FinancialClosingExecutionStatus>[] => [
      { label: t`Success`, value: FinancialClosingExecutionStatus.Success },
      { label: t`Error`, value: FinancialClosingExecutionStatus.Error },
      { label: t`Pending`, value: FinancialClosingExecutionStatus.Pending },
    ];

  return {
    getFinancialClosingExecutionStatusLabel,
    getFinancialClosingExecutionStatusOptions,
  };
};

export function getFinancialClosingExecutionStatusColor(
  status: string,
): 'green' | 'red' | 'blue' | 'yellow' | 'gray' {
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
