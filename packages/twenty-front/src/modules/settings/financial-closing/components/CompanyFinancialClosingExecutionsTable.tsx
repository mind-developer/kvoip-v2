import { CompanyFinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/CompanyFinancialClosingExecution';
import { SettingsPath } from '@/types/SettingsPath';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconChevronRight } from '@tabler/icons-react';
import { Card, CardContent, Section } from 'twenty-ui/layout';
import { CompanyFinancialClosingExecutionRow } from '~/pages/settings/financial-closing/components/CompanyFinancialClosingExecutionRow';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledInfoValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledNoResults = styled(Section)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin-top: 20px;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledObjectTableRow = styled(TableRow)`
  grid-template-columns: 140px 1fr 100px 100px 36px;
`;

const StyledCompanyHeader = styled(TableHeader)`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

type CompanyFinancialClosingExecutionsTableProps = {
  companyExecutions: CompanyFinancialClosingExecution[];
  loading: boolean;
};

export const CompanyFinancialClosingExecutionsTable = ({ 
  companyExecutions, 
  loading 
}: CompanyFinancialClosingExecutionsTableProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const getCompanyFinancialClosingExecutionViewPath = (id: string) => {
    const path = getSettingsPath(SettingsPath.CompanyFinancialClosingExecution).replace(
      ':companyFinancialClosingExecutionId',
      id,
    );
    return path;
  };


  if (loading) {
    return (
      <StyledCard>
        <StyledCardContent>
          <StyledInfoValue>Carregando execuções das companhias...</StyledInfoValue>
        </StyledCardContent>
      </StyledCard>
    );
  }

  if (companyExecutions.length === 0) {
    return (
      <StyledCard>
        <StyledCardContent>
          <StyledInfoValue>Nenhuma execução de companhia encontrada.</StyledInfoValue>
        </StyledCardContent>
      </StyledCard>
    );
  }

  return (
    <Table>
      <StyledObjectTableRow>
        <TableHeader>{t`Date`}</TableHeader>
        <StyledCompanyHeader>{t`Company`}</StyledCompanyHeader>
        <TableHeader align="right">{t`Value`}</TableHeader>
        <TableHeader align="right">{t`Status`}</TableHeader>
        <TableHeader></TableHeader>
      </StyledObjectTableRow>

      {companyExecutions.map(
        (execution) => (
          <CompanyFinancialClosingExecutionRow
            key={execution.id}
            execution={execution}
            action={
              <StyledIconChevronRight
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            }
            link={getCompanyFinancialClosingExecutionViewPath(execution.id)}
          />
        )
      )}

      {companyExecutions.length === 0 && (
        <StyledNoResults>
          {t`No executions found`}
        </StyledNoResults>
      )}
    </Table>
  );
};
