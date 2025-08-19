/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { FilterType } from '@/dashboard-links/utils/filterLinkLogsData';
import { format, fromUnixTime } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';
import { LinkLogsWorkspaceEntity } from '~/generated/graphql';
import { getRandomHexColor } from '~/utils/get-hex-random-collor';

export type PlatformGroupedData = {
  name: string;
  [platform: string]: string | number;
};

export type PlatformChartData = {
  data: PlatformGroupedData[];
  sourceKeyColors: Record<string, string>;
};

export const groupPlatformsOverTime = (
  linkLogs: LinkLogsWorkspaceEntity[],
  filter: FilterType,
): PlatformChartData => {
  if (!linkLogs.length) {
    return { data: [], sourceKeyColors: {} };
  }

  const parsedLogs = linkLogs.map((log) => ({
    ...log,
    createdAt: fromUnixTime(Number(log.createdAt) / 1000),
  }));

  const groupedData: Record<string, PlatformGroupedData> = {};
  const sourceKeyColors: PlatformChartData['sourceKeyColors'] = {};

  parsedLogs.forEach((log) => {
    let periodKey = '';

    if (filter === 'week') {
      periodKey = format(log.createdAt, 'dd/MM');
    } else if (filter === 'month') {
      periodKey = format(log.createdAt, 'MMMM', { locale: undefined });
    } else if (filter === 'year') {
      periodKey = format(log.createdAt, 'MMM/yyyy');
    }

    const platformType = log?.platform || 'Unknown';

    if (!groupedData[periodKey]) {
      groupedData[periodKey] = { name: periodKey };
    }

    const currentCount = (groupedData[periodKey][platformType] as number) ?? 0;
    groupedData[periodKey][platformType] = currentCount + 1;

    if (isDefined(platformType) && !sourceKeyColors[platformType]) {
      sourceKeyColors[platformType] = getRandomHexColor();
    }
  });

  const data = Object.values(groupedData);

  return { data, sourceKeyColors };
};
