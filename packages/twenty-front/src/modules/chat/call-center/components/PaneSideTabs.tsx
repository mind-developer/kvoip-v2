import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';



type TabItemProps = {
  id: string;
  title: string;
  incomingMessages?: number;
};

type PaneSideTabsProps = {
  tabListId: string;
  tabs: TabItemProps[];
  loading?: boolean;
  className?: string;
};

const StyledContainer = styled.div`
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  user-select: none;
`;

export const PaneSideTabs = ({
  tabs,
  tabListId,
  loading,
  className,
}: PaneSideTabsProps) => {
  // Transform TabItemProps to SingleTabProps
  const transformedTabs: SingleTabProps[] = tabs.map((tab) => ({
    id: tab.id,
    title: tab.title,
    incomingMessages: tab.incomingMessages,
  }));

  return (
    <TabList
      tabs={transformedTabs}
      loading={loading}
      className={className}
      componentInstanceId={tabListId}
      behaveAsLinks={false}
    />
  );
};
