import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import {
  getFinancialClosingExecutionStatusColor,
  useFinancialClosingExecutionStatusTranslations,
} from '@/settings/financial-closing/constants/FinancialClosingExecutionStatus';
import {
  getExecutionStatusTagColor,
  getExecutionStatusText,
} from '@/settings/financial-closing/constants/LogLevelColors';
import {
  getTypeEmissionNFColor,
  useTypeEmissionNFTranslations,
} from '@/settings/financial-closing/constants/TypeEmissionNF';
import { type CompanyFinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/CompanyFinancialClosingExecution';
import { AppPath } from '@/types/AppPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'twenty-ui/components';
import { IconExternalLink } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/layout';
import { useNavigateApp } from '~/hooks/useNavigateApp';

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
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledInfoValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledViewChargeButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

type CompanyFinancialClosingExecutionDetailsCardProps = {
  execution: CompanyFinancialClosingExecution;
};

export const CompanyFinancialClosingExecutionDetailsCard = ({
  execution,
}: CompanyFinancialClosingExecutionDetailsCardProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const navigate = useNavigate();
  const navigateApp = useNavigateApp();
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();
  const { getFinancialClosingExecutionStatusLabel } =
    useFinancialClosingExecutionStatusTranslations();
  const { getTypeEmissionNFLabel } = useTypeEmissionNFTranslations();

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

  const handleViewCharge = () => {
    if (execution.charge?.id) {
      //   try {
      //     console.log('Abrindo charge no command menu:', {
      //       recordId: execution.charge.id,
      //       objectNameSingular: CoreObjectNameSingular.Charge,
      //     });

      //     // Tentar abrir no command menu primeiro
      //     openRecordInCommandMenu({
      //       recordId: execution.charge.id,
      //       objectNameSingular: CoreObjectNameSingular.Charge,
      //       resetNavigationStack: false, // Mudança: usar false para manter o contexto
      //     });
      //   } catch (error) {
      navigateApp(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Charge,
        objectRecordId: execution.charge?.id!,
      });
      //   }
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    // try {
    //   console.log('Abrindo invoice no command menu:', {
    //     recordId: invoiceId,
    //     objectNameSingular: 'invoice',
    //   });

    //   // Tentar abrir no command menu primeiro
    //   openRecordInCommandMenu({
    //     recordId: invoiceId,
    //     objectNameSingular: 'invoice', // Usando string literal até ser adicionado ao CoreObjectNameSingular
    //     resetNavigationStack: false, // Mudança: usar false para manter o contexto
    //   });
    // } catch (error) {
    //   console.error('Erro ao abrir invoice no command menu, tentando navegação direta:', error);
    //     // Fallback: navegação direta para a página do registro
    //     navigateApp(AppPath.RecordShowPage, {
    //       objectNameSingular: 'invoice',
    //       objectRecordId: invoiceId,
    //     });
    // }

    navigateApp(AppPath.RecordShowPage, {
      objectNameSingular: 'invoice',
      objectRecordId: invoiceId,
    });
  };

  return (
    <StyledCard>
      <StyledCardContent>
        {/* <StyledInfoRow>
          <StyledInfoLabel>Nome:</StyledInfoLabel>
          <StyledInfoValue>{execution.name || '-'}</StyledInfoValue>
        </StyledInfoRow> */}

        <StyledInfoRow>
          <StyledInfoLabel>{t`Company`}:</StyledInfoLabel>
          <StyledInfoValue>{execution.company?.name || '-'}</StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Status`}:</StyledInfoLabel>
          <Tag
            color={getFinancialClosingExecutionStatusColor(execution.status)}
            text={getFinancialClosingExecutionStatusLabel(execution.status)}
            weight="medium"
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Charge Value`}:</StyledInfoLabel>
          <StyledInfoValue>
            {formatCurrency(execution.chargeValue)}
          </StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Execution Date`}:</StyledInfoLabel>
          <StyledInfoValue>{formatDate(execution.executedAt)}</StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Completed Cost Identification`}:</StyledInfoLabel>
          <Tag
            color={getExecutionStatusTagColor(execution.calculatedChargeValue)}
            text={getExecutionStatusText(execution.calculatedChargeValue)}
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Completed Boleto Issuance`}:</StyledInfoLabel>
          <StyledButtonContainer>
            {execution.charge?.id && (
              <StyledViewChargeButton
                variant="secondary"
                size="small"
                onClick={handleViewCharge}
                title={t`View`}
                Icon={IconExternalLink}
              />
            )}
            <Tag
              color={getExecutionStatusTagColor(
                execution.completedBoletoIssuance,
              )}
              text={getExecutionStatusText(execution.completedBoletoIssuance)}
            />
          </StyledButtonContainer>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Completed Invoice Issuance`}:</StyledInfoLabel>
          <StyledButtonContainer>
            {execution.invoices && execution.invoices.length > 0 && (
              <>
                {execution.invoices.map((invoice) => (
                  <>
                    {invoice.id && (
                      <StyledViewChargeButton
                        key={invoice.id}
                        variant="secondary"
                        size="small"
                        onClick={() => handleViewInvoice(invoice.id)}
                        // Deixe maiusculo
                        title={`${invoice.nfType?.toUpperCase()}`}
                        Icon={IconExternalLink}
                      />
                    )}
                  </>
                ))}
              </>
            )}
            <Tag
              color={getExecutionStatusTagColor(
                execution.completedBoletoIssuance,
              )}
              text={getExecutionStatusText(execution.completedBoletoIssuance)}
            />
          </StyledButtonContainer>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Invoice Emission Type`}:</StyledInfoLabel>
          <Tag
            color={getTypeEmissionNFColor(
              execution.invoiceEmissionType || 'NOTHING',
            )}
            text={getTypeEmissionNFLabel(
              execution.invoiceEmissionType || 'NOTHING',
            )}
            weight="medium"
          />
        </StyledInfoRow>
      </StyledCardContent>
    </StyledCard>
  );
};
