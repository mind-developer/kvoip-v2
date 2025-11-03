import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import {
  getFinancialClosingExecutionStatusColor,
  useFinancialClosingExecutionStatusTranslations,
} from '@/settings/financial-closing/constants/FinancialClosingExecutionStatus';
import { type FinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/FinancialClosingExecution';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Tag } from 'twenty-ui/components';
import { IconClockPlay } from 'twenty-ui/display';

export type SettingsFinancialClosingExecutionItemTableRowProps = {
  action: ReactNode;
  execution: FinancialClosingExecution;
  link?: string;
};

export const StyledObjectTableRow = styled(TableRow)`
  grid-template-columns: 180px 98.7px 98.7px 98.7px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNameLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const FinancialClosingExecutionRow = ({
  action,
  execution,
  link,
}: FinancialClosingExecutionRowProps) => {
  const theme = useTheme();
  const { getFinancialClosingExecutionStatusLabel } =
    useFinancialClosingExecutionStatusTranslations();

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();

    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');

    return `${horas}:${minutos} ${dia}/${mes}/${ano}`;
  };

  return (
    <StyledObjectTableRow key={execution.id} to={link}>
      <StyledNameTableCell>
        <IconClockPlay
          style={{ minWidth: theme.icon.size.md }}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
        <StyledNameLabel title={execution.name}>
          {formatDate(execution.executedAt)}
        </StyledNameLabel>
      </StyledNameTableCell>

      <TableCell>
        <Tag
          color={getFinancialClosingExecutionStatusColor(execution.status)}
          text={getFinancialClosingExecutionStatusLabel(execution.status)}
          weight="medium"
        />
      </TableCell>

      <TableCell align="right">{execution.companiesTotal || '0'}</TableCell>
      <TableCell align="right">{execution.companiesWithError || '0'}</TableCell>

      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledObjectTableRow>
  );
};
