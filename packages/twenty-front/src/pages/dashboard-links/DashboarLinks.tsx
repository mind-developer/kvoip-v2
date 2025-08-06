/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { IconChartBar, IconSearch } from '@tabler/icons-react';

import { DashboardLinksChart } from '@/dashboard-links/components/DashboardLinksChart';
import { DashboardPageContainer } from '@/dashboard-links/components/ui/DashboardLinksPageContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { DashboardLinksPageBodyLoader } from '@/dashboard-links/components/ui/DashboardLinksPageBodyLoader';
import { GET_DASHBOARD_LINKLOGS } from '@/dashboard-links/graphql/queries/getDashboardLinklogs';
import { TextInput } from '@/ui/input/components/TextInput';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { Query } from '~/generated-metadata/graphql';
import { groupLinkLogsData } from '~/utils/groupLinkLogsData';

const StyledSection = styled(Section)`
  padding: 16px;
`;

const StyledSearchInput = styled(TextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const DashboardLinks = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error } = useQuery<
    Pick<Query, 'getDashboardLinklogs'>
  >(GET_DASHBOARD_LINKLOGS);

  if (isDefined(error))
    throw new Error(error?.message ?? 'No Data', {
      cause: error?.cause ?? JSON.stringify(data),
    });

  const chartData = groupLinkLogsData(data?.getDashboardLinklogs ?? []);

  return (
    <PageContainer>
      <PageHeader title="Dashboard Links" Icon={IconChartBar} />
      <PageBody>
        <DashboardPageContainer>
          {loading ? (
            <DashboardLinksPageBodyLoader />
          ) : (
            <>
              <DashboardLinksChart chartData={chartData} />
              <StyledSection fullWidth>
                <H2Title title="All links" />

                <StyledSearchInput
                  LeftIcon={IconSearch}
                  placeholder="Search for an object..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  fullWidth
                />
              </StyledSection>
            </>
          )}
        </DashboardPageContainer>
      </PageBody>
    </PageContainer>
  );
};
