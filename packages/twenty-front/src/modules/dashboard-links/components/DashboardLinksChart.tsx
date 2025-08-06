import { DashboardFilterDropdown } from '@/dashboard-links/components/ui/DashboardFilterDropdown';
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

const StyledChartContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  height: 85%;
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

interface DashboardLinksChartProps {
  chartData: LinklogsChartData;
}

// TODO: Add filter functionality to the dropdown menu
export const DashboardLinksChart = ({
  chartData: { data, sourceKeyColors },
}: DashboardLinksChartProps) => {
  return (
    <StyledChartContainer>
      <StyledHeader>
        <label>Origem dos acessos</label>
        <DashboardFilterDropdown
          onChange={() => console.log('Clicou')}
          scopeKey="dashboard-filter"
        />
      </StyledHeader>
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
            <Bar key={key} dataKey={key} stackId="a" fill={color} name={key} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </StyledChartContainer>
  );
};
