import { SettingsPath } from '@/types/SettingsPath';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { H2Title, IconPlus, IconSearch, useIcons } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledSettingsCard = styled(SettingsCard)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;
const StyledTextInput = styled(TextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

export const SettingsServiceCenterSectors = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const { records: agents } = useFindManyRecords<Agent & { id: string }>({
    objectNameSingular: CoreObjectNameSingular.Agent,
  });
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const [filteredSectors, setFilteredSectors] = useState<Sector[]>(sectors);

  function filterSectors({ name }: { name: string }) {
    const searchFiltered = sectors.filter((sector) =>
      sector.name.toLowerCase().includes(name.toLowerCase()),
    );
    //add more filters
    const filtered = searchFiltered;
    return filtered;
  }
  const [searchBySectorName, setSearchBySectorName] = useState('');

  function getSectorDescription(sectorId: string): string {
    const agentIdsForSector = agents
      .filter((agent) => agent.sectorId === sectorId)
      .map((agent) => agent.id);
    const agentNames = workspaceMembers
      .filter((member) =>
        member.agentId ? agentIdsForSector.includes(member.agentId) : false,
      )
      .map(
        (member) =>
          member.name.firstName + ' ' + member.name.lastName.slice(0, 1) + '.',
      )
      .slice(0, 5);

    if (agentNames.length === 0) return 'No agents assigned';
    return agentNames.length >= 5
      ? agentNames.join(', ') + ' ' + t`and more`
      : agentNames.join(', ');
  }

  return (
    <SubMenuTopBarContainer
      title={`Sectors`}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewSector)}
        >
          <Button
            Icon={IconPlus}
            title={t`Add sector`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: t`Service Center`,
          href: getSettingsPath(SettingsPath.ServiceCenter),
        },
        { children: t`Sectors` },
      ]}
    >
      <SettingsPageContainer>
        <div>
          <H2Title
            title={t`Manage sectors`}
            description={t`Sectors group agents for easier management`}
          />
          <StyledTextInput
            onChange={(s) => {
              setFilteredSectors(filterSectors({ name: s }));
              setSearchBySectorName(s);
            }}
            value={searchBySectorName}
            placeholder="Search for a sector..."
            LeftIcon={IconSearch}
          />
          {filteredSectors.map((sector) => {
            const Icon = getIcon(sector.icon, 'IconDots');
            return (
              <StyledSettingsCard
                Icon={<Icon size={18} />}
                title={sector.name}
                description={'• ' + getSectorDescription(sector.id)}
              />
            );
          })}
        </div>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
