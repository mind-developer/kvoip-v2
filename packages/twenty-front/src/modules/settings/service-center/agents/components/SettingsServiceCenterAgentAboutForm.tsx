import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { type AgentFormValues } from '@/settings/service-center/agents/validation-schemas/agentFormSchema';
import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, IconUser, useIcons } from 'twenty-ui/display';
import { SelectOption, Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

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

export default function SettingsServiceCenterAgentAboutForm() {
  const form = useFormContext<AgentFormValues>();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const { records: inboxes } = useFindManyRecords<
    Inbox & { __typename: string }
  >({
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
            <Controller
              name="workspaceMemberId"
              control={form.control}
              render={({ field }) => (
                <FormSelectFieldInput
                  defaultValue={''}
                  label={t`Workspace Member`}
                  options={memberOptions}
                  onChange={(value) => {
                    if (!value) return;
                    field.onChange(value);
                  }}
                />
              )}
            />
            <Controller
              name="sectorId"
              control={form.control}
              render={({ field }) => (
                <FormSelectFieldInput
                  defaultValue={''}
                  label={t`Sector`}
                  options={sectorOptions}
                  onChange={(value) => {
                    if (!value) return;
                    field.onChange(value);
                  }}
                />
              )}
            />
          </StyledFormRow>
          <StyledFormRow>
            <Controller
              name="inboxes"
              control={form.control}
              render={({ field }) => (
                <FormMultiSelectFieldInput
                  defaultValue={''}
                  label={t`Inboxes`}
                  options={inboxOptions}
                  onChange={(value) => {
                    if (!value) return;
                    const inboxValues =
                      typeof value === 'string' ? [value] : value;
                    field.onChange(inboxValues);
                  }}
                />
              )}
            />
          </StyledFormRow>
          <StyledFormRow>
            <Controller
              name="isAdmin"
              control={form.control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onChange={() => field.onChange(!field.value)}
                />
              )}
            />
            <p style={{ marginLeft: 4 }}>Administrator</p>
          </StyledFormRow>
        </StyledForm>
      </div>
    </SettingsPageContainer>
  );
}
