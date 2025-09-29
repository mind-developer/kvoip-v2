import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ServiceCenterTabContent } from '@/settings/service-center/agents/components/ServiceCenterTabContent';
import { ServiceCenterTabList } from '@/settings/service-center/agents/components/ServiceCenterTabList';
import { SettingsServiceCenterFilterDropdown } from '@/settings/service-center/agents/components/SettingsServiceCenterFilterDropdown';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { IntegrationType } from '@/settings/service-center/types/IntegrationType';

import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { Sector } from '~/generated/graphql';

const StyledShowServiceCenterTabs = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
`;

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  overflow-x: auto;
`;

export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';

type ServiceCenterTabsProps = {
  isRightDrawer?: boolean;
  loading?: boolean;
};

export const ServiceCenterTabs = ({
  loading,
  isRightDrawer = false,
}: ServiceCenterTabsProps) => {
  const [activeTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    TAB_LIST_COMPONENT_ID,
  );
  // const activeTabId = useRecoilValue(activeTabIdState);
  // const { t } = useTranslation();

  const isMobile = useIsMobile() || isRightDrawer;
  const sectors = useFindManyRecords<Sector & { __typename: string }>({
    objectNameSingular: 'sector',
  }).records;
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const [agents, setAgents] = useState<Agent[]>(
    useFindManyRecords<Agent & { __typename: string }>({
      objectNameSingular: 'agent',
    }).records,
  );
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  const tabs = [
    {
      id: 'allAgents',
      name: 'All',
      icon: 'IconUsers',
    },
    {
      id: IntegrationType.WHATSAPP,
      name: 'Whatsapp',
      icon: 'IconBrandWhatsapp',
    },
    // {
    //   id: IntegrationType.MESSENGER,
    //   name: 'Messenger',
    //   icon: 'IconBrandMessenger',
    // },
  ];

  const filterAgentsBySector = (sectorId: string) =>
    setSelectedSectorId(sectorId);

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (agents) {
      const filteredAgents =
        selectedSectorId && selectedSectorId !== ''
          ? agents.filter((agent) =>
              agent?.sectors?.some((sector) => sector.id === selectedSectorId),
            )
          : agents;

      const filteredByIntegration = filteredAgents.filter((agent) =>
        agent.inboxes?.some((inbox) => {
          if (activeTabId === IntegrationType.WHATSAPP) {
            return (
              inbox.integrationType.toLowerCase() === IntegrationType.WHATSAPP
            );
          } else if (activeTabId === IntegrationType.MESSENGER) {
            return (
              inbox.integrationType.toLowerCase() === IntegrationType.MESSENGER
            );
          }
          return true;
        }),
      );

      setAgents(filteredByIntegration);
    }
  }, [agents, workspaceMembers, selectedSectorId, activeTabId]);

  return (
    <StyledShowServiceCenterTabs isMobile={isMobile}>
      <StyledTabListContainer>
        <ServiceCenterTabList
          loading={loading}
          tabListId={TAB_LIST_COMPONENT_ID}
          tabs={tabs}
        />
        <SettingsServiceCenterFilterDropdown
          options={
            sectors?.map((sector) => ({
              label: sector.name,
              value: sector.id,
              icon: sector.icon,
            })) ?? []
          }
          handleCallbackFilter={filterAgentsBySector}
          scopeKey={'service-center-agents'}
        />
      </StyledTabListContainer>

      {activeTabId && agents.length > 0 && (
        <ServiceCenterTabContent agents={agents} />
      )}
    </StyledShowServiceCenterTabs>
  );
};
