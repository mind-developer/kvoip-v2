import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { CreateAgent } from '@/settings/service-center/agents/types/Agent';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Dispatch, SetStateAction } from 'react';
import { H2Title, IconUser, useIcons } from 'twenty-ui/display';
import { SelectOption, Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { Inbox, Sector, WorkspaceMember } from '~/generated/graphql';

const StyledForm = styled.div`
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: center;
  justify-content: center;
`;

const StyledFormRow = styled(Section)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export default function SettingsServiceCenterAgentAboutForm({
  agent,
  setAgent,
}: {
  agent: CreateAgent;
  setAgent: Dispatch<SetStateAction<CreateAgent>>;
}) {
  const { records: workspaceMembers } = useFindManyRecords<
    WorkspaceMember & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { records: sectors } = useFindManyRecords<Sector>({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const { records: inboxes } = useFindManyRecords<Inbox>({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });
  const assignableWorkspaceMembers = workspaceMembers.filter(
    (workspaceMember) => !workspaceMember.agentId,
  );

  const { getIcon } = useIcons();

  const memberOptions =
    assignableWorkspaceMembers.map(
      (member) =>
        ({
          Icon: IconUser,
          label: member.name.firstName + ' ' + member.name.lastName,
          value: member.id,
        }) as SelectOption,
    ) ?? [];
  const sectorOptions =
    sectors.map(
      (sector) =>
        ({
          label: sector.name,
          value: sector.id,
          Icon: getIcon(sector.icon),
        }) as SelectOption,
    ) ?? [];
  const inboxOptions =
    inboxes.map(
      (inbox) =>
        ({
          label: inbox.name,
          value: inbox.id,
        }) as SelectOption,
    ) ?? [];

  return (
    <SettingsPageContainer>
      <div style={{ overflow: 'visible' }}>
        <H2Title
          title={t`About`}
          description={t`Define this agent's properties`}
        />
        <StyledForm>
          <StyledFormRow>
            <FormSelectFieldInput
              defaultValue={''}
              label={t`Workspace Member`}
              options={memberOptions}
              onChange={(s) => {
                if (!s) return;
                setAgent({ ...agent, workspaceMemberId: s });
              }}
            />
            <FormSelectFieldInput
              defaultValue={''}
              label={t`Sector`}
              options={sectorOptions}
              onChange={(s) => {
                if (!s) return;
                setAgent({ ...agent, sectorId: s });
              }}
            />
          </StyledFormRow>
          <StyledFormRow>
            <FormMultiSelectFieldInput
              defaultValue={''}
              label={t`Inboxes`}
              options={inboxOptions}
              onChange={(s) => {
                if (!s) return;
                setAgent({
                  ...agent,
                  inboxes: typeof s === 'string' ? [s] : s,
                });
              }}
            />
          </StyledFormRow>
          <StyledFormRow>
            <Toggle
              value={agent.isAdmin}
              onChange={() => setAgent({ ...agent, isAdmin: !agent.isAdmin })}
            />
            <p style={{ marginLeft: 4 }}>Administrator</p>
          </StyledFormRow>
        </StyledForm>
      </div>
    </SettingsPageContainer>
  );
}
