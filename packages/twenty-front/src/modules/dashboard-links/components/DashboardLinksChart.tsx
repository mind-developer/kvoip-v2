import { DashboardFilterDropdown } from '@/dashboard-links/components/ui/DashboardFilterDropdown';
import { FilterType } from '@/dashboard-links/utils/filterLinkLogsData';
import styled from '@emotion/styled';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LinklogsChartData } from '~/types/LinkLogs';

const StyledChartContainer = styled.div<{ hasData: boolean }>`
  background: ${({ theme }) => theme.background.secondary};
  height: ${({ hasData }) => (hasData ? '85%' : 'auto')};
  padding: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledText = styled.p`
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
`;

interface DashboardLinksChartProps {
  chartData: LinklogsChartData;
  onFilterChange: (filter: FilterType) => void;
}

export const DashboardLinksChart = ({
  chartData: { data, sourceKeyColors },
  onFilterChange,
}: DashboardLinksChartProps) => {
  const hasData = data.length > 0;

  return (
    <StyledChartContainer hasData={hasData}>
      <StyledHeader>
        <label>Origem dos acessos</label>
        <DashboardFilterDropdown
          onChange={onFilterChange}
          scopeKey="dashboard-filter"
        />
      </StyledHeader>
      {hasData ? (
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend align="left" />
            {Object.entries(sourceKeyColors).map(([key, color]) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={color}
                name={key}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <StyledText>Nenhum dado para exibir</StyledText>
      )}
    </StyledChartContainer>
  );
};
