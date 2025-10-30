import { type Theme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';

export type LogLevel = 'ERROR' | 'WARN' | 'WARNING' | 'INFO' | 'DEBUG';

export const getLogLevelTagColor = (
  level: string,
): 'green' | 'red' | 'blue' | 'orange' | 'gray' => {
  switch (level?.toUpperCase()) {
    case 'ERROR':
      return 'red';
    case 'WARN':
    case 'WARNING':
      return 'orange';
    case 'INFO':
      return 'blue';
    case 'DEBUG':
      return 'gray';
    default:
      return 'gray';
  }
};

export const getLogLevelBorderColor = (level: string, theme: Theme): string => {
  switch (level?.toUpperCase()) {
    case 'ERROR':
      return theme.color.red;
    case 'WARN':
    case 'WARNING':
      return theme.color.orange;
    case 'INFO':
      return theme.color.blue;
    case 'DEBUG':
      return theme.color.gray;
    default:
      return theme.color.gray;
  }
};

export const getLogLevelBackgroundColor = (
  level: string,
  theme: Theme,
): string => {
  switch (level?.toUpperCase()) {
    case 'ERROR':
      return theme.color.red20;
    case 'WARN':
    case 'WARNING':
      return theme.color.orange20;
    case 'INFO':
      return theme.color.blue20;
    case 'DEBUG':
      return theme.color.gray20;
    default:
      return theme.color.gray20;
  }
};

export const getLogLevelTextColor = (level: string, theme: Theme): string => {
  switch (level?.toUpperCase()) {
    case 'ERROR':
      return theme.color.red60;
    case 'WARN':
    case 'WARNING':
      return theme.color.orange60;
    case 'INFO':
      return theme.color.blue60;
    case 'DEBUG':
      return theme.color.gray60;
    default:
      return theme.color.gray60;
  }
};

// Funções para cores de status de execução
export const getExecutionStatusTagColor = (
  isCompleted: boolean,
): 'green' | 'red' => {
  return isCompleted ? 'green' : 'red';
};

export const getExecutionStatusText = (isCompleted: boolean): string => {
  const { t } = useLingui();

  return isCompleted ? t`Executed` : t`Failed`;
};

// Funções para cores de billing model
export const getBillingModelTagColor = (): 'green' => {
  return 'green';
};
