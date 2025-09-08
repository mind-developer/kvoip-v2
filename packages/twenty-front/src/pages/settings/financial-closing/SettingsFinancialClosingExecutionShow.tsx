import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { generateDepthOneWithoutRelationsRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneWithoutRelationsRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { CompanyFinancialClosingExecutionsTable } from '@/settings/financial-closing/components/CompanyFinancialClosingExecutionsTable';
import { FinancialClosingExecutionDetailsCard } from '@/settings/financial-closing/components/FinancialClosingExecutionDetailsCard';
import { FinancialClosingExecutionLogsList } from '@/settings/financial-closing/components/FinancialClosingExecutionLogsList';
import { FinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/FinancialClosingExecution';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconBuildingSkyscraper, IconFileText } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const TAB_LIST_COMPONENT_ID = 'financial-closing-execution-tabs';

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledFormSection = styled(Section)`
  padding-left: 0 !important;
`;

const StyledFormSectionLogs = styled(Section)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;


export const SettingsFinancialClosingExecutionShow = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigate();
  const { financialClosingExecutionId } = useParams<{ financialClosingExecutionId: string }>();

  const { record: execution, loading: executionLoading } = useFindOneRecord<FinancialClosingExecution>({
    objectNameSingular: CoreObjectNameSingular.FinancialClosingExecution,
    objectRecordId: financialClosingExecutionId,
  });

  // Buscar metadata dos objetos para gerar os campos automaticamente
  const { objectMetadataItem: companyObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Company,
  });

  const { objectMetadataItem: companyExecutionObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.CompanyFinancialClosingExecution,
  });

  const { records: companyExecutions, loading: companyExecutionsLoading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.CompanyFinancialClosingExecution,
    filter: financialClosingExecutionId
      ? {
          financialClosingExecutionId: {
            eq: financialClosingExecutionId,
          },
        }
      : undefined,
    recordGqlFields: {
      ...generateDepthOneWithoutRelationsRecordGqlFields({
        objectMetadataItem: companyExecutionObjectMetadataItem,
      }),
      company: generateDepthOneRecordGqlFields({
        objectMetadataItem: companyObjectMetadataItem,
      }),
    },
  });

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    TAB_LIST_COMPONENT_ID,
  );

  const tabs = [
    {
      id: 'execution-details',
      title: t`Detalhes da Execução`,
      Icon: IconFileText,
    },
    {
      id: 'company-executions',
      title: t`Execuções das Companhias`,
      Icon: IconBuildingSkyscraper,
    },
  ];

  if (executionLoading) {
    return (
      <SubMenuTopBarContainer
        title={'Detalhes da Execução'}
        links={[
          {
            children: 'Fechamentos',
            href: getSettingsPath(SettingsPath.FinancialClosing),
          },
          { children: 'Detalhes' },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            <H2Title title="" description={'Carregando...'} />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  if (!execution) {
    return (
      <SubMenuTopBarContainer
        title={'Detalhes da Execução'}
        links={[
          {
            children: 'Fechamentos',
            href: getSettingsPath(SettingsPath.FinancialClosing),
          },
          { children: 'Detalhes' },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            <H2Title title="" description={'Execução não encontrada'} />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  return (
    <SubMenuTopBarContainer
      title={`Detalhes da Execução`}
      links={[
        {
          children: 'Fechamentos',
          href: getSettingsPath(SettingsPath.FinancialClosing),
        },
        { children: 'Detalhes' },
      ]}
    >
      <SettingsPageContainer>
        <StyledContentContainer>
          <TabList
            tabs={tabs}
            componentInstanceId={TAB_LIST_COMPONENT_ID}
          />
          
          {activeTabId === 'execution-details' && (
            <StyledFormSection>
              <H2Title
                title={t`Informações da Execução`}
                description={t`Detalhes gerais da execução do fechamento financeiro`}
              />
              
              <FinancialClosingExecutionDetailsCard execution={execution} />
              
              {execution.logs && execution.logs.length > 0 && (
                <StyledFormSectionLogs>
                  <H2Title
                    title={t`Logs de Execução`}
                    description={t`Histórico detalhado da execução`}
                  />
                  
                  <FinancialClosingExecutionLogsList logs={execution.logs} />
                </StyledFormSectionLogs>
              )}
            </StyledFormSection>
          )}
          
          {activeTabId === 'company-executions' && (
            <StyledFormSection>
              <H2Title
                title={t`Execuções das Companhias`}
                description={t`Lista de execuções específicas por companhia`}
              />
              
              <CompanyFinancialClosingExecutionsTable 
                companyExecutions={companyExecutions as any}
                loading={companyExecutionsLoading}
              />
            </StyledFormSection>
          )}
        </StyledContentContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
