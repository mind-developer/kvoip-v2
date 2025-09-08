import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { CompanyFinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/CompanyFinancialClosingExecution';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Tag } from 'twenty-ui/components';
import { IconClockPlay, useIcons } from 'twenty-ui/display';
import { getFinancialClosingExecutionStatusColor, getFinancialClosingExecutionStatusLabel } from '@/settings/financial-closing/constants/FinancialClosingExecutionStatus';

export type SettingsCompanyFinancialClosingExecutionItemTableRowProps = {
  action: ReactNode;
  execution: CompanyFinancialClosingExecution;
  link?: string;
};

export const StyledObjectTableRow = styled(TableRow)`
  grid-template-columns: 140px 1fr 100px 100px 36px;
  min-height: 50px;
  align-items: center;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledDateContainer = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

const StyledTime = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDate = styled.div`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledCompanyTableCell = styled(TableCell)`
  min-height: 50px;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledCompanyName = styled.div`
  line-height: 1.3;
  word-break: break-word;
  hyphens: auto;
  max-width: 100%;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const CompanyFinancialClosingExecutionRow = ({
  action,
  execution,
  link,
}: SettingsCompanyFinancialClosingExecutionItemTableRowProps) => {
  const theme = useTheme();
  
  const { getIcon } = useIcons();
  const Icon = getIcon('clock-play');

  const getColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'green';
      case 'ERROR':
        return 'red';
      default:
        return 'yellow';
    }
  };

    const formatDateTime = (dateString?: string | null) => {
        if (!dateString) return { time: '-', date: '-' };
        const date = new Date(dateString);

        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();

        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');

        return {
            time: `${horas}:${minutos}`,
            date: `${dia}/${mes}/${ano}`
        };
    };

    const formatCurrency = (value?: string | number | null) => {
        if (!value || value === '0') return 'R$ 0,00';
        
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        
        if (isNaN(numericValue)) return 'R$ 0,00';
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numericValue);
    };

  return (
    <StyledObjectTableRow key={execution.id} to={link}>

      <StyledNameTableCell>
          <IconClockPlay
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        <StyledDateContainer>
          <StyledTime>{formatDateTime(execution.executedAt).time}</StyledTime>
          <StyledDate>{formatDateTime(execution.executedAt).date}</StyledDate>
        </StyledDateContainer>
      </StyledNameTableCell>
      
      <StyledCompanyTableCell>
        <StyledCompanyName>
          {execution.company?.name || 'N/A'}
        </StyledCompanyName>
      </StyledCompanyTableCell>

      <TableCell align="right">{formatCurrency(execution.chargeValue)}</TableCell>

      <TableCell align="right">
        <Tag 
          color={getFinancialClosingExecutionStatusColor(execution.status)} 
          text={getFinancialClosingExecutionStatusLabel(execution.status)} 
          weight="medium"
        />
      </TableCell>


      <StyledActionTableCell>{action}</StyledActionTableCell>

    </StyledObjectTableRow>
  );
};
