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
      company: generateDepthOneRecordGqlFields({
        objectMetadataItem: companyObjectMetadataItem,
      }),
    },
  });


  if (executionLoading) {
    return (
      <SubMenuTopBarContainer
        title={'Detalhes de Execução da Companhia'}
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
        title={'Detalhes de Execução da Companhia'}
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
      title={`Detalhes da Execução - ${execution.company?.name}`}
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
          <StyledFormSection>
            <H2Title
              title={t`Informações da Execução`}
              description={t`Detalhes gerais da execução da companhia no fechamento financeiro`}
            />
            
            <CompanyFinancialClosingExecutionDetailsCard execution={execution} />
          </StyledFormSection>
          
          {execution.logs && execution.logs.length > 0 && (
            <StyledFormSectionLogs>
              <H2Title
                title={t`Logs de Execução`}
                description={t`Histórico detalhado da execução da companhia`}
              />
              
              <CompanyFinancialClosingExecutionLogsList logs={execution.logs} />
            </StyledFormSectionLogs>
          )}
        </StyledContentContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
