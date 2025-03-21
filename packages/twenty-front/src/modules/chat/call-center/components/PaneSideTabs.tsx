import styled from '@emotion/styled';
import * as React from 'react';

import { Tab } from '@/ui/layout/tab/components/Tab';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { TabListScope } from '@/ui/layout/tab/scopes/TabListScope';

type TabItemProps = {
  id: string;
  name: string;
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
  const initialActiveTabId =
    tabs.find((tab) => tab.id === 'mine')?.id || tabs[0]?.id || null;

  const { activeTabId, setActiveTabId } = useTabList(tabListId);

  React.useEffect(() => {
    setActiveTabId(initialActiveTabId || null);
  }, [initialActiveTabId, setActiveTabId]);

  return (
    <TabListScope tabListScopeId={tabListId}>
      <StyledContainer className={className}>
        {tabs.map((tab) => (
          <Tab
            id={tab.id.toString()}
            key={tab.id}
            title={tab.name}
            active={tab.id.toString() === activeTabId}
            onClick={() => setActiveTabId(tab.id.toString())}
            disabled={loading}
            incomingMessages={tab.incomingMessages}
          />
        ))}
      </StyledContainer>
    </TabListScope>
  );
};
