import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';
import { useId } from 'react';

type TabItemProps = {
  id: string;
  title: string;
  incomingMessages?: number;
};

type PaneSideTabsProps = {
  tabs: TabItemProps[];
  loading?: boolean;
  className?: string;
};

const StyledTabList = styled(TabList)`
  min-width: 270px;
`;

export const PaneSideTabs = ({
  tabs,
  loading,
  className,
}: PaneSideTabsProps) => {
  const id = useId();
  // Transform TabItemProps to SingleTabProps
  const transformedTabs: SingleTabProps[] = tabs.map((tab) => ({
    id: tab.id,
    title: tab.title,
    incomingMessages: tab.incomingMessages,
  }));

  return (
    <StyledTabList
      tabs={transformedTabs}
      loading={loading}
      className={className}
      componentInstanceId={id}
      behaveAsLinks={false}
    />
  );
};
