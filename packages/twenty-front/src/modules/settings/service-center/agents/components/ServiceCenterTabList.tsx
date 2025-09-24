import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useIcons } from 'twenty-ui/display';

type TabItemProps = {
  id: string;
  name: string;
  icon: string;
  hide?: boolean;
  disabled?: boolean;
  pill?: string;
};

type ServiceCenterTabListProps = {
  tabListId: string;
  tabs: TabItemProps[];
  loading?: boolean;
  className?: string;
};

export const ServiceCenterTabList = ({
  tabs,
  tabListId,
  loading,
  className,
}: ServiceCenterTabListProps) => {
  const { getIcon } = useIcons();

  // Transform TabItemProps to SingleTabProps
  const transformedTabs: SingleTabProps[] = tabs.map((tab) => ({
    id: tab.id.toString(),
    title: tab.name,
    Icon: getIcon(tab.icon),
    hide: tab.hide,
    disabled: tab.disabled,
    pill: tab.pill,
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
