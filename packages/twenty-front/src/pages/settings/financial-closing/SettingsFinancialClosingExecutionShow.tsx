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
import { type FinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/FinancialClosingExecution';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate, useParams } from 'react-router-dom';
import {
  H2Title,
  IconBuildingSkyscraper,
  IconFileText,
} from 'twenty-ui/display';
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
  const { financialClosingExecutionId } = useParams<{
    financialClosingExecutionId: string;
  }>();

  const { record: execution, loading: executionLoading } =
    useFindOneRecord<FinancialClosingExecution>({
      objectNameSingular: CoreObjectNameSingular.FinancialClosingExecution,
      objectRecordId: financialClosingExecutionId,
    });

  const { objectMetadataItem: companyObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Company,
    });

  const { objectMetadataItem: companyExecutionObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        CoreObjectNameSingular.CompanyFinancialClosingExecution,
    });

  const { records: companyExecutions, loading: companyExecutionsLoading } =
    useFindManyRecords({
      objectNameSingular:
        CoreObjectNameSingular.CompanyFinancialClosingExecution,
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

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    TAB_LIST_COMPONENT_ID,
  );

  const getFinancialClosingExecutionsViewPath = (id: string) => {
    const path = getSettingsPath(
      SettingsPath.FinancialClosingExecutions,
    ).replace(':financialClosingId', id);
    return path;
  };

  const tabs = [
    {
      id: 'execution-details',
      title: t`Execution Details`,
      Icon: IconFileText,
    },
    {
      id: 'company-executions',
      title: t`Company Executions`,
      Icon: IconBuildingSkyscraper,
    },
  ];

  if (executionLoading) {
    return (
      <SubMenuTopBarContainer
        title={t`Details of Execution`}
        links={[
          {
            children: t`Financial Closings`,
            href: getSettingsPath(SettingsPath.FinancialClosing),
          },
          { children: t`Executions` },
          { children: t`Details` },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            <H2Title title="" description={t`Loading` + '...'} />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  if (!execution) {
    return (
      <SubMenuTopBarContainer
        title={t`Details of Execution`}
        links={[
          {
            children: t`Financial Closings`,
            href: getSettingsPath(SettingsPath.FinancialClosing),
          },
          { children: t`Executions` },
          { children: t`Details` },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            <H2Title title="" description={t`Execution not found`} />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  return (
    <SubMenuTopBarContainer
      title={t`Details of Execution`}
      links={[
        {
          children: t`Financial Closings`,
          href: getSettingsPath(SettingsPath.FinancialClosing),
        },
        {
          children: t`Executions`,
          href: getFinancialClosingExecutionsViewPath(
            execution.financialClosingId,
          ),
        },
        { children: t`Details` },
      ]}
    >
      <SettingsPageContainer>
        <StyledContentContainer>
          <TabList tabs={tabs} componentInstanceId={TAB_LIST_COMPONENT_ID} />

          {activeTabId === 'execution-details' && (
            <StyledFormSection>
              <H2Title
                title={t`Execution Information`}
                description={t`General details of the financial closing execution`}
              />

              <FinancialClosingExecutionDetailsCard execution={execution} />

              {execution.logs && execution.logs.length > 0 && (
                <StyledFormSectionLogs>
                  <H2Title
                    title={t`Execution Logs`}
                    description={t`Detailed history of the execution`}
                  />

                  <FinancialClosingExecutionLogsList logs={execution.logs} />
                </StyledFormSectionLogs>
              )}
            </StyledFormSection>
          )}

          {activeTabId === 'company-executions' && (
            <StyledFormSection>
              <H2Title
                title={t`Company Executions`}
                description={t`List of specific executions by company`}
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
