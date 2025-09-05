import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';

import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useEffect, useState } from 'react';
import { H2Title, IconChevronRight, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsFinancialClosings } from '@/settings/financial-closing/components/SettingsFinancialClosings';
import { useFindAllFinancialClosings } from '@/settings/financial-closing/hooks/useFindAllFinancialClosings';
import { useNavigate, useParams } from 'react-router-dom';
import { ServiceCenterTabs } from '@/settings/service-center/agents/components/ServiceCenterTab';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/FinancialClosingExecution';
import styled from '@emotion/styled';
import { StyledObjectTableRow } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { Trans, useLingui } from '@lingui/react/macro';
import { useTheme } from '@emotion/react';
import { FinancialClosingExecutionRow } from '~/pages/settings/financial-closing/components/FinancialClosingExecutionRow';
import { IconError404 } from '@tabler/icons-react';

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

export const SettingsFinancialClosingExecutions = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigate();

  const { financialClosingId } = useParams<{ financialClosingId?: string }>();

  const { financialClosings, refetch: refetchFinancialClosings  } = useFindAllFinancialClosings();
  const activeFinancialClosing = financialClosings.find((financialClosing) => financialClosing.id === financialClosingId);

  const { records: executions } = useFindManyRecords<FinancialClosingExecution>({
    objectNameSingular: CoreObjectNameSingular.FinancialClosingExecution,
    filter: financialClosingId
      ? {
          financialClosingId: {
            eq: financialClosingId,
          },
        }
      : undefined,
  });

  useEffect(() => {
    refetchFinancialClosings();
  }, []);

  const getFinancialClosingExecutionViewPath = (id: string) => {
    const path = getSettingsPath(SettingsPath.FinancialClosingExecution).replace(
      ':financialClosingExecutionId',
      id,
    );
    return path;
  };

  return (
    <SubMenuTopBarContainer
      title={'Execuções' + (activeFinancialClosing ? (' - ' + activeFinancialClosing.name) : '')}
      links={[
        {
          children: 'Fechamentos',
          href: getSettingsPath(SettingsPath.FinancialClosing),
        },
        { children: 'Histórico' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="" description={'Histórico de execução do fechamento financeiro'} />
          
          <Table>
            <StyledObjectTableRow>
              <TableHeader>Data</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader align="right">Executados</TableHeader>
              <TableHeader align="right">Erros</TableHeader>
              <TableHeader></TableHeader>
            </StyledObjectTableRow>

            {executions.map(
              (execution) => (
                <FinancialClosingExecutionRow
                  key={execution.id}
                  execution={execution}
                  action={
                    <StyledIconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  link={getFinancialClosingExecutionViewPath(execution.id)}
                />
              )
            )}

            {executions.length === 0 && (
              <StyledNoResults>
                {t`No executions found`}
              </StyledNoResults>
            )}
          </Table>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
