/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { IconChartBar } from '@tabler/icons-react';

import { DashboardLinksChart } from '@/dashboard-links/components/DashboardLinksChart';
import { DashboardPageContainer } from '@/dashboard-links/components/ui/DashboardLinksPageContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { DashboardLinksPageBodyLoader } from '@/dashboard-links/components/ui/DashboardLinksPageBodyLoader';
import { GET_DASHBOARD_LINKLOGS } from '@/dashboard-links/graphql/queries/getDashboardLinklogs';
import {
  filterLinkLogsData,
  FilterType,
} from '@/dashboard-links/utils/filterLinkLogsData';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';

import { DashboardAccessOverTime } from '@/dashboard-links/components/DashboardAccessOverTime';
import { generateSelectOptions } from '@/dashboard-links/utils/generateSelectOptions';
import { groupPlatformsOverTime } from '@/dashboard-links/utils/groupLinkLogsAccessOverTimeData';
import { Select } from '@/ui/input/components/Select';
import { isDefined } from 'twenty-shared/utils';
import { Query } from '~/generated-metadata/graphql';
import { groupLinkLogsData } from '~/utils/groupLinkLogsData';

const StyledSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-inline: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

export const DashboardLinks = () => {
  const [filter, setFilter] = useState<FilterType>('week');
  const [filterAccessOverTime, setFilterAccessOverTime] =
    useState<FilterType>('week');

  const [selectedLink, setSelectedLink] = useState<string>('none');
  const [selectedCountry, setSelectedCountry] = useState<string>('none');
  const [selectedState, setSelectedState] = useState<string>('none');
  const [selectedCity, setSelectedCity] = useState<string>('none');

  const { data, loading, error } = useQuery<
    Pick<Query, 'getDashboardLinklogs'>
  >(GET_DASHBOARD_LINKLOGS);

  if (isDefined(error))
    throw new Error(error?.message ?? 'No Data', {
      cause: error?.cause ?? JSON.stringify(data),
    });

  const rawData = useMemo(() => data?.getDashboardLinklogs ?? [], [data]);
  const filteredData = filterLinkLogsData(rawData, filter);
  const chartData = groupLinkLogsData(filteredData);

  const filterLinkOptions = generateSelectOptions(
    rawData,
    'linkName',
    'Selecione um link',
  );

  const filterCountryOptions = generateSelectOptions(
    rawData,
    'country',
    'Selecione um país',
  );

  const filterStateOptions = generateSelectOptions(
    rawData,
    'regionName',
    'Selecione um estado',
  );

  const filterCityOptions = generateSelectOptions(
    rawData,
    'city',
    'Selecione uma cidade',
  );

  const filteredBySelection = useMemo(() => {
    let result = rawData;

    if (selectedLink !== 'none') {
      result = result.filter((item) => item.linkName === selectedLink);

      if (selectedCountry !== 'none') {
        result = result.filter((item) => item.country === selectedCountry);
      }
      if (selectedState !== 'none') {
        result = result.filter((item) => item.regionName === selectedState);
      }
      if (selectedCity !== 'none') {
        result = result.filter((item) => item.city === selectedCity);
      }
    } else {
      result = [];
    }

    return result;
  }, [rawData, selectedLink, selectedCountry, selectedState, selectedCity]);

  const chartDataAccessOverTime = groupPlatformsOverTime(
    filteredBySelection,
    filterAccessOverTime,
  );

  return (
    <PageContainer>
      <PageHeader title="Dashboard Links" Icon={IconChartBar} />
      <PageBody>
        <DashboardPageContainer>
          {loading ? (
            <DashboardLinksPageBodyLoader />
          ) : (
            <>
              <DashboardLinksChart
                chartData={chartData}
                onFilterChange={setFilter}
              />
              <StyledSection>
                <Select
                  dropdownId="filter-link"
                  options={filterLinkOptions}
                  value={selectedLink}
                  onChange={(val) => {
                    setSelectedLink(String(val));
                    setSelectedCountry('none');
                    setSelectedState('none');
                    setSelectedCity('none');
                  }}
                  fullWidth
                />
                <Select
                  dropdownId="filter-country"
                  options={filterCountryOptions}
                  value={selectedCountry}
                  onChange={(val) => {
                    setSelectedCountry(String(val));
                    setSelectedState('none');
                    setSelectedCity('none');
                  }}
                  fullWidth
                  disabled={selectedLink === 'none'}
                />
                <Select
                  dropdownId="filter-state"
                  options={filterStateOptions}
                  value={selectedState}
                  onChange={(val) => {
                    setSelectedState(String(val));
                    setSelectedCity('none');
                  }}
                  fullWidth
                  disabled={selectedLink === 'none'}
                />
                <Select
                  dropdownId="filter-city"
                  options={filterCityOptions}
                  value={selectedCity}
                  onChange={(val) => setSelectedCity(String(val))}
                  fullWidth
                  disabled={selectedLink === 'none'}
                />
              </StyledSection>
              <DashboardAccessOverTime
                chartData={chartDataAccessOverTime}
                onFilterChange={setFilterAccessOverTime}
              />
            </>
          )}
        </DashboardPageContainer>
      </PageBody>
    </PageContainer>
  );
};
