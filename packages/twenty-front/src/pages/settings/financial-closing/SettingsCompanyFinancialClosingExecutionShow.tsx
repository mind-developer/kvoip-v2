/* @kvoip-woulz proprietary */
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { CompanyFinancialClosingExecutionDetailsCard } from '@/settings/financial-closing/components/CompanyFinancialClosingExecutionDetailsCard';
import { CompanyFinancialClosingExecutionLogsList } from '@/settings/financial-closing/components/CompanyFinancialClosingExecutionLogsList';
import { CompanyFinancialClosingExecution } from '@/settings/financial-closing/types/financialClosingExecutions/CompanyFinancialClosingExecution';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { generateDepthOneWithoutRelationsRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneWithoutRelationsRecordGqlFields';

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledFormSection = styled(Section)`
  padding-left: 0 !important;
`;

const StyledFormSectionLogs = styled(Section)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsCompanyFinancialClosingExecutionShow = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigate();
  const { companyFinancialClosingExecutionId } = useParams<{ companyFinancialClosingExecutionId: string }>();

  // Buscar metadata do objeto Company para incluir na query
  const { objectMetadataItem: companyObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Company,
  });

  const { objectMetadataItem: executionObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.FinancialClosingExecution,
  });

  const { objectMetadataItem: companyExecutionObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.CompanyFinancialClosingExecution,
  });

  const { record: execution, loading: executionLoading } = useFindOneRecord<CompanyFinancialClosingExecution>({
    objectNameSingular: CoreObjectNameSingular.CompanyFinancialClosingExecution,
    objectRecordId: companyFinancialClosingExecutionId,
    recordGqlFields: {
      ...generateDepthOneWithoutRelationsRecordGqlFields({
        objectMetadataItem: companyExecutionObjectMetadataItem,
      }),
      financialClosingExecutionId: true,
      company: generateDepthOneRecordGqlFields({
        objectMetadataItem: companyObjectMetadataItem,
      }),
      financialClosingExecution: generateDepthOneRecordGqlFields({
        objectMetadataItem: executionObjectMetadataItem,
      }),
      charge: {
        id: true,
      },
      invoices: {
        id: true,
        nfStatus: true,
        nfType: true,
      },
    },
  });

  const getFinancialClosingExecutionsViewPath = (id: string) => {
    const path = getSettingsPath(SettingsPath.FinancialClosingExecutions).replace(
      ':financialClosingId',
      id,
    );
    return path;
  };

  const getFinancialClosingExecutionViewPath = (id: string) => {
    const path = getSettingsPath(SettingsPath.FinancialClosingExecution).replace(
      ':financialClosingExecutionId',
      id,
    );
    return path;
  };

  if (executionLoading) {
    return (
      <SubMenuTopBarContainer
        title={t`Details of Company Execution`}
        links={[
          {
            children: t`Financial Closings`,  
            href: getSettingsPath(SettingsPath.FinancialClosing),
          },
          { children: t`Executions` },
          { children: t`Details` },
          { children: t`Company Executions` },
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
        title={t`Details of Company Execution`}
        links={[
          {
            children: t`Financial Closings`,
            href: getSettingsPath(SettingsPath.FinancialClosing),
          },
          { children: t`Executions` },
          { children: t`Details` },
          { children: t`Company Execution` },
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
      title={ t`Details of Execution` + ` - ${execution.company?.name}`}
      links={[
        {
          children: t`Financial Closings`,
          href: getSettingsPath(SettingsPath.FinancialClosing),
        },
        { children: t`Executions`,
          href: getFinancialClosingExecutionsViewPath(execution.financialClosingExecution?.financialClosingId || ''),
        },
        { 
          children: t`Details`,
          href: getFinancialClosingExecutionViewPath(execution.financialClosingExecutionId),
        },
        { children: t`Company Execution` },
      ]}
    >
      <SettingsPageContainer>
        <StyledContentContainer>
          <StyledFormSection>
            <H2Title
              title={t`Information of Execution`}
              description={t`Details of the execution of the company in the financial closing`}
            />
            
            <CompanyFinancialClosingExecutionDetailsCard execution={execution} />
          </StyledFormSection>
          
          {execution.logs && execution.logs.length > 0 && (
            <StyledFormSectionLogs>
              <H2Title
                title={t`Logs of Execution`}
                description={t`Detailed history of the execution of the company`}
              />
              
              <CompanyFinancialClosingExecutionLogsList logs={execution.logs} />
            </StyledFormSectionLogs>
          )}
        </StyledContentContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
