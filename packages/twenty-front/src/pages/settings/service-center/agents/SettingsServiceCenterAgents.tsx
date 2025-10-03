import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Avatar, H2Title, IconPlus, IconSearch } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
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

  const { records: workspaceMembers } = useFindManyRecords<
    WorkspaceMember & { __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.WorkspaceMember });
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

  return (
    <SubMenuTopBarContainer
      title={'Agents'}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewAgent)}
        >
          <Button
            Icon={IconPlus}
            title={'Add agent'}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: 'Service Center',
          href: getSettingsPath(SettingsPath.ServiceCenter),
        },
        { children: 'Agents' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Manage agents`}
            description={t`Agents can be assigned to sectors and message inboxes`}
          />
          <StyledTextInput
            placeholder="Search for an agent..."
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
                Icon={
                  <Avatar
                    placeholder={member.name.firstName}
                    avatarUrl={member.avatarUrl}
                    type="rounded"
                  />
                }
                title={member.name.firstName + ' ' + member.name.lastName}
              />
            );
          })}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
