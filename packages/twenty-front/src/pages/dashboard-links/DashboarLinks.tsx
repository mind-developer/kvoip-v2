/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { IconChartBar } from '@tabler/icons-react';

import { DashboardPageContainer } from '@/dashboard-links/components/ui/DashboardLinksPageContainer';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

export const DashboardLinks = () => {
  /*const { data, loading, error } = useQuery<LinkLogsData>(getLinklogs, {
    variables: {
      filter: {},
      orderBy: [{ position: 'AscNullsFirst' }],
      limit: 100,
      lastCursor: null,
    },
  });*/

  const linkLogs = [];
  const chartData = [];

  return (
    <DashboardPageContainer>
      <PageContainer>
        <PageHeader title="Dashboard Links" Icon={IconChartBar} />
      </PageContainer>
    </DashboardPageContainer>
  );
};
