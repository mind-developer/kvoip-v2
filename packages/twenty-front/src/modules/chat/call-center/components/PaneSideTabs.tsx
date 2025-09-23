import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

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
