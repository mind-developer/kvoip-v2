import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { CreateAgent } from '@/settings/service-center/agents/types/Agent';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Dispatch, SetStateAction } from 'react';
import { IconUser } from 'twenty-ui/display';
import { SelectOption, Toggle } from 'twenty-ui/input';
import { Inbox, Sector, WorkspaceMember } from '~/generated/graphql';

const StyledForm = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: center;
  justify-content: center;
`;
const StyledFormContainer = styled.div`
  /* margin: ${({ theme }) => theme.spacing(0, 8, 2)}; */
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
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
      <StyledForm>
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
        <FormSelectFieldInput
          defaultValue={''}
          label={t`Inbox`}
          options={inboxOptions}
          onChange={(s) => {
            if (!s) return;
            setAgent({ ...agent, inboxId: s });
          }}
        />
      </StyledForm>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <Toggle
          value={agent.isAdmin}
          onChange={() => setAgent({ ...agent, isAdmin: !agent.isAdmin })}
        />
        <p>Administrator</p>
      </div>
    </SettingsPageContainer>
  );
}
