import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, H2Title, IconPlus, IconSearch } from 'twenty-ui/display';
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
import { WorkspaceMember } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledSettingsCard = styled(SettingsCard)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;
const StyledTextInput = styled(TextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

export const SettingsServiceCenterAgents = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigate();

  const { records: workspaceMembers } = useFindManyRecords<
    WorkspaceMember & { __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.WorkspaceMember });

  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.Sector });

  const { records: agents } = useFindManyRecords<
    Agent & { __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.Agent });

  const workspaceMembersWithAgent = workspaceMembers.filter(
    (workspaceMember) => !!workspaceMember.agentId,
  );

  const [filteredAgents, setFilteredAgents] = useState<WorkspaceMember[]>(
    workspaceMembersWithAgent,
  );

  function filterAgents({ name }: { name: string }) {
    const searchFiltered = workspaceMembersWithAgent.filter((member) => {
      const nameConcat = member.name.firstName + ' ' + member.name.lastName;
      return nameConcat.toLowerCase().includes(name.toLowerCase());
    });
    const filtered = searchFiltered;
    return filtered;
  }
  const [searchByWorkspaceMemberName, setSearchByWorkspaceMemberName] =
    useState('');

  function getAgentStatus(agentId: string): string {
    const agent = agents.find((agent) => agent.id === agentId);
    const sector = sectors.find((sector) => sector.id === agent?.sectorId);
    return sector?.name || t`No sector assigned`;
  }

  return (
    <SubMenuTopBarContainer
      title={t`Agents`}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewAgent)}
        >
          <Button
            Icon={IconPlus}
            title={t`Add agent`}
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
        { children: t`Agents` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Manage agents`}
            description={t`Agents can be assigned to sectors`}
          />
          <StyledTextInput
            placeholder={t`Search for an agent...`}
            value={searchByWorkspaceMemberName}
            LeftIcon={IconSearch}
            onChange={(s) => {
              setFilteredAgents(filterAgents({ name: s }));
              setSearchByWorkspaceMemberName(s);
            }}
          />
          {filteredAgents.map((member) => {
            return (
              <StyledSettingsCard
                key={member.id}
                Status={getAgentStatus(member.agentId)}
                Icon={
                  <Avatar
                    placeholder={member.name.firstName}
                    avatarUrl={member.avatarUrl}
                    type="rounded"
                  />
                }
                title={member.name.firstName + ' ' + member.name.lastName}
                onClick={() => {
                  navigate(
                    getSettingsPath(SettingsPath.ServiceCenterEditAgent, {
                      agentSlug: member.agentId,
                    }),
                  );
                }}
              />
            );
          })}
        </Section>
        {filterAgents.length === 0 && (
          <Section>
            <div style={{ marginTop: theme.spacing(10) }}>
              <AnimatedPlaceholderEmptyContainer>
                <AnimatedPlaceholder type="noRecord" />
                <AnimatedPlaceholderEmptyTextContainer>
                  <AnimatedPlaceholderEmptyTitle>
                    {t`No chatbots found`}
                  </AnimatedPlaceholderEmptyTitle>
                  <AnimatedPlaceholderEmptySubTitle>
                    {t`Create a chatbot to get started`}
                  </AnimatedPlaceholderEmptySubTitle>
                </AnimatedPlaceholderEmptyTextContainer>
              </AnimatedPlaceholderEmptyContainer>
            </div>
          </Section>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
