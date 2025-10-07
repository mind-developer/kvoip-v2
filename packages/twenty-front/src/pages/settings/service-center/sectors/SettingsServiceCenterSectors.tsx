import { SettingsPath } from '@/types/SettingsPath';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Agent } from 'http';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { H2Title, IconPlus, IconSearch, useIcons } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  Section,
} from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { truncateList } from '~/pages/settings/service-center/utils/truncateList';
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
  const theme = useTheme();
  const { getIcon } = useIcons();
  const navigate = useNavigate();

  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
    recordGqlFields: { id: true, icon: true, name: true, agents: true },
  });
  const { records: agents } = useFindManyRecords<
    Agent & { id: string; __typename: string }
  >({
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

  function getSectorStatus(sectorId: string): string {
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
      );

    const truncated = truncateList(agentNames, 5, 'No agents assigned');
    return truncated;
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
            description={t`Group agents into sectors for easier management`}
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
          <Section>
            {filteredSectors.map((sector) => {
              const Icon = getIcon(sector.icon, 'IconDots');
              return (
                <StyledSettingsCard
                  key={sector.id}
                  Icon={<Icon size={16} />}
                  title={sector.name}
                  Status={'• ' + getSectorStatus(sector.id)}
                  onClick={() => {
                    navigate(
                      getSettingsPath(SettingsPath.ServiceCenterEditSector, {
                        sectorSlug: sector.id,
                      }),
                    );
                  }}
                />
              );
            })}
            {filteredSectors.length === 0 && (
              <div style={{ marginTop: theme.spacing(10) }}>
                <AnimatedPlaceholderEmptyContainer>
                  <AnimatedPlaceholder type="noRecord" />
                  <AnimatedPlaceholderEmptyTextContainer>
                    <AnimatedPlaceholderEmptyTitle>
                      {t`No sectors created yet`}
                    </AnimatedPlaceholderEmptyTitle>
                    <AnimatedPlaceholderEmptySubTitle>
                      {t`Create a sector to get started`}
                    </AnimatedPlaceholderEmptySubTitle>
                  </AnimatedPlaceholderEmptyTextContainer>
                </AnimatedPlaceholderEmptyContainer>
              </div>
            )}
          </Section>
        </div>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
