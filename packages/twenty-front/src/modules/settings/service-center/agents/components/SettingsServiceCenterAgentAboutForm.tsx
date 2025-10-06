import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { type AgentFormValues } from '@/settings/service-center/agents/validation-schemas/agentFormSchema';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, IconUser, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
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

type SettingsServiceCenterAgentAboutFormProps = {
  isEditMode?: boolean;
};

export default function SettingsServiceCenterAgentAboutForm({
  isEditMode = false,
}: SettingsServiceCenterAgentAboutFormProps) {
  const form = useFormContext<AgentFormValues>();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const { getIcon } = useIcons();

  const workspaceMemberId = form.watch('workspaceMemberId');

  // In edit mode, include the current workspace member
  // In create mode, only show unassigned workspace members
  const selectableWorkspaceMembers = isEditMode
    ? workspaceMembers.filter(
        (member) => !member.agentId || member.id === workspaceMemberId,
      )
    : workspaceMembers.filter((member) => !member.agentId);

  const memberOptions =
    selectableWorkspaceMembers.map(
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

  return (
    <Section>
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
                  key={`workspace-member-${field.value}`}
                  defaultValue={field.value}
                  label={t`Workspace Member`}
                  options={memberOptions}
                  readonly={isEditMode}
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
                  key={`sector-${field.value}`}
                  defaultValue={field.value}
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
        </StyledForm>
      </div>
    </Section>
  );
}
