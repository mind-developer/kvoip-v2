import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';

type TabItemProps = {
  id: string;
  title: string;
  incomingMessages?: number;
};

type ChatNavigationDrawerTabsProps = {
  tabs: TabItemProps[];
  loading?: boolean;
  className?: string;
};

const StyledTabList = styled(TabList)`
  min-width: 450px;
`;

export const ChatNavigationDrawerTabs = ({
  tabs,
  loading,
  className,
}: ChatNavigationDrawerTabsProps) => {
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
      componentInstanceId="chat-navigation-drawer-tabs"
      behaveAsLinks={false}
    />
  );
};
