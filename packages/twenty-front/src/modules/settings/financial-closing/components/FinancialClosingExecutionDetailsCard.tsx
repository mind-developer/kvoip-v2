import {
  getFinancialClosingExecutionStatusColor,
  useFinancialClosingExecutionStatusTranslations,
} from '@/settings/financial-closing/constants/FinancialClosingExecutionStatus';
import {
  getExecutionStatusTagColor,
  getExecutionStatusText,
} from '@/settings/financial-closing/constants/LogLevelColors';
import { type FinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/FinancialClosingExecution';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
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
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledInfoValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

type FinancialClosingExecutionDetailsCardProps = {
  execution: FinancialClosingExecution;
};

export const FinancialClosingExecutionDetailsCard = ({
  execution,
}: FinancialClosingExecutionDetailsCardProps) => {
  const { t } = useLingui();
  const { getFinancialClosingExecutionStatusLabel } =
    useFinancialClosingExecutionStatusTranslations();

  return (
    <StyledCard>
      <StyledCardContent>
        {/* <StyledInfoRow>
          <StyledInfoLabel>Nome:</StyledInfoLabel>
          <StyledInfoValue>{execution.name}</StyledInfoValue>
        </StyledInfoRow> */}

        <StyledInfoRow>
          <StyledInfoLabel>{t`Status`}:</StyledInfoLabel>
          <Tag
            color={getFinancialClosingExecutionStatusColor(execution.status)}
            text={getFinancialClosingExecutionStatusLabel(execution.status)}
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Execution Date`}:</StyledInfoLabel>
          <StyledInfoValue>
            {new Date(execution.executedAt).toLocaleString()}
          </StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Total of Companies`}:</StyledInfoLabel>
          <StyledInfoValue>{execution.companiesTotal}</StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Companies with Error`}:</StyledInfoLabel>
          <StyledInfoValue>{execution.companiesWithError}</StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Completed Company Search`}:</StyledInfoLabel>
          <Tag
            color={getExecutionStatusTagColor(execution.completedCompanySearch)}
            text={getExecutionStatusText(execution.completedCompanySearch)}
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Completed Cost Identification`}:</StyledInfoLabel>
          <Tag
            color={getExecutionStatusTagColor(
              execution.completedCostIdentification,
            )}
            text={getExecutionStatusText(execution.completedCostIdentification)}
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Completed Boleto Issuance`}:</StyledInfoLabel>
          <Tag
            color={getExecutionStatusTagColor(
              execution.completedBoletoIssuance,
            )}
            text={getExecutionStatusText(execution.completedBoletoIssuance)}
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Completed Invoice Issuance`}:</StyledInfoLabel>
          <Tag
            color={getExecutionStatusTagColor(
              execution.completedInvoiceIssuance,
            )}
            text={getExecutionStatusText(execution.completedInvoiceIssuance)}
          />
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Created at`}:</StyledInfoLabel>
          <StyledInfoValue>
            {new Date(execution.createdAt).toLocaleString()}
          </StyledInfoValue>
        </StyledInfoRow>

        <StyledInfoRow>
          <StyledInfoLabel>{t`Updated at`}:</StyledInfoLabel>
          <StyledInfoValue>
            {new Date(execution.updatedAt).toLocaleString()}
          </StyledInfoValue>
        </StyledInfoRow>
      </StyledCardContent>
    </StyledCard>
  );
};
