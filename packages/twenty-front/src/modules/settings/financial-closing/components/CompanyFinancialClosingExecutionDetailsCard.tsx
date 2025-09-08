import { getFinancialClosingExecutionStatusColor, getFinancialClosingExecutionStatusLabel } from '@/settings/financial-closing/constants/FinancialClosingExecutionStatus';
import { getExecutionStatusTagColor, getExecutionStatusText } from '@/settings/financial-closing/constants/LogLevelColors';
import { getTypeEmissionNFColor, getTypeEmissionNFLabel } from '@/settings/financial-closing/constants/TypeEmissionNF';
import { CompanyFinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/CompanyFinancialClosingExecution';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Tag } from 'twenty-ui/components';
import { Card, CardContent } from 'twenty-ui/layout';

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const StyledInfoLabel = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledInfoValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

type CompanyFinancialClosingExecutionDetailsCardProps = {
  execution: CompanyFinancialClosingExecution;
};

export const CompanyFinancialClosingExecutionDetailsCard = ({ 
  execution 
}: CompanyFinancialClosingExecutionDetailsCardProps) => {
  const theme = useTheme();

  const formatCurrency = (value?: string | number | null) => {
    if (!value || value === '0') return 'R$ 0,00';
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();

    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');

    return `${horas}:${minutos} - ${dia}/${mes}/${ano}`;
  };

  return (
    <StyledCard>
      <StyledCardContent>
        {/* <StyledInfoRow>
          <StyledInfoLabel>Nome:</StyledInfoLabel>
          <StyledInfoValue>{execution.name || '-'}</StyledInfoValue>
        </StyledInfoRow> */}

        <StyledInfoRow>
          <StyledInfoLabel>Companhia:</StyledInfoLabel>
          <StyledInfoValue>{execution.company?.name || '-'}</StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>Status:</StyledInfoLabel>
          <Tag
            color={getFinancialClosingExecutionStatusColor(execution.status)}
            text={getFinancialClosingExecutionStatusLabel(execution.status)}
            weight="medium"
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>Valor da Cobrança:</StyledInfoLabel>
          <StyledInfoValue>{formatCurrency(execution.chargeValue)}</StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>Data de Execução:</StyledInfoLabel>
          <StyledInfoValue>{formatDate(execution.executedAt)}</StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>Identificação de Custos Concluída:</StyledInfoLabel>
          <Tag 
            color={getExecutionStatusTagColor(execution.calculatedChargeValue)} 
            text={getExecutionStatusText(execution.calculatedChargeValue)} 
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>Emissão do Boleto Concluída:</StyledInfoLabel>
          <Tag 
            color={getExecutionStatusTagColor(execution.completedBoletoIssuance)} 
            text={getExecutionStatusText(execution.completedBoletoIssuance)} 
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>Emissão de NFs Concluída:</StyledInfoLabel>
          <Tag 
            color={getExecutionStatusTagColor(execution.completedInvoiceIssuance)} 
            text={getExecutionStatusText(execution.completedInvoiceIssuance)} 
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>Tipo de Emissão de NF:</StyledInfoLabel>
          <Tag
            color={getTypeEmissionNFColor(execution.invoiceEmissionType || 'NOTHING')}
            text={getTypeEmissionNFLabel(execution.invoiceEmissionType || 'NOTHING')}
            weight="medium"
          />
        </StyledInfoRow>
      </StyledCardContent>
    </StyledCard>
  );
};
