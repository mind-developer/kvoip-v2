import { getLogLevelBackgroundColor, getLogLevelBorderColor, getLogLevelTagColor } from '@/settings/financial-closing/constants/LogLevelColors';
import { FinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/FinancialClosingExecution';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/components';
import { Card, CardContent } from 'twenty-ui/layout';

const StyledLogCard = styled(Card)<{ level: string }>`
  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 1px solid ${({ level, theme }) => getLogLevelBorderColor(level, theme)};
  background-color: ${({ level, theme }) => getLogLevelBackgroundColor(level, theme)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledLogCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLogTimestamp = styled.div`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-family: monospace;
`;

const StyledLogMessage = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  line-height: 1.4;
`;

type FinancialClosingExecutionLogsListProps = {
  logs: FinancialClosingExecution['logs'];
};

export const FinancialClosingExecutionLogsList = ({ 
  logs 
}: FinancialClosingExecutionLogsListProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');
    
    return `${horas}:${minutos}:${segundos} ${dia}/${mes}/${ano}`;
  };


  if (!logs || logs.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: theme.spacing(4),
        color: theme.font.color.tertiary 
      }}>
        Nenhum log encontrado
      </div>
    );
  }

  return (
    <div>
      {logs.map((log, index) => (
        <StyledLogCard key={index} level={log.level}>
          <StyledLogCardContent>
            <StyledLogHeader>
              <StyledLogTimestamp>
                {formatTimestamp(log.timestamp)}
              </StyledLogTimestamp>
              <Tag
                color={getLogLevelTagColor(log.level)}
                text={log.level.toUpperCase()}
                weight="medium"
              />
            </StyledLogHeader>
            <StyledLogMessage>
              {log.message}
            </StyledLogMessage>
          </StyledLogCardContent>
        </StyledLogCard>
      ))}
    </div>
  );
};
