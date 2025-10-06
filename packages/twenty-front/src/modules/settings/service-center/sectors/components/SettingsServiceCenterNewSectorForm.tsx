import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateMultipleRecordsFromManyObjects } from '@/object-record/hooks/useUpdateMultipleRecordsFromManyObjects';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { type NewSectorFormValues } from '@/settings/service-center/sectors/validation-schemas/newSectorFormSchema';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, Label, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledFormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled(Label)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledSection = styled(Section)`
  min-height: 400px;
`;

export const SettingsServiceCenterNewSectorForm = () => {
  const { t } = useLingui();
  const form = useFormContext<NewSectorFormValues>();
  const { getIcon } = useIcons();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const agents = workspaceMembers.filter((wm) => wm.agentId);

  const { updateMultipleRecordsFromManyObjects } =
    useUpdateMultipleRecordsFromManyObjects();

  return (
    <SettingsPageContainer>
      <Section>
        <H2Title
          title={t`About`}
          description={t`Define this sector's properties.`}
        />
        <StyledFormContainer>
          <div>
            <StyledLabel>{t`Icon`}</StyledLabel>
            <Controller
              name="icon"
              control={form.control}
              render={({ field }) => (
                <IconPicker
                  selectedIconKey={field.value}
                  onChange={(i) => field.onChange(i.iconKey)}
                />
              )}
            />
          </div>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChange={field.onChange}
                label={t`Name`}
              />
            )}
          />
        </StyledFormContainer>
      </Section>
      {agents.length > 0 && (
        <StyledSection>
          <H2Title
            title={t`Add agents`}
            description={t`Choose agents for this sector. You can add more agents later.`}
          />
          <Controller
            name="agentIds"
            control={form.control}
            render={({ field }) => (
              <FormMultiSelectFieldInput
                label={t`Agents`}
                options={
                  workspaceMembers
                    .filter((wm) => wm.agentId)
                    .map((wm) => ({
                      label: wm.name.firstName + ' ' + wm.name.lastName,
                      value: wm.agentId,
                    })) as SelectOption[]
                }
                defaultValue={field.value}
                onChange={(value) => {
                  const agentIds = Array.isArray(value)
                    ? value
                    : typeof value === 'string'
                      ? [value]
                      : [];
                  field.onChange(agentIds);
                }}
                readonly={false}
                placeholder={t`Select agents`}
              />
            )}
          />
        </StyledSection>
      )}
      {/* <Section>
        <H2Title
          title={t`Templates`}
          description={t`Choose a template for this sector`}
        />
        <StyledFormContainer>
          {sectorTemplates.map((template) => (
            <StyledTag
              key={template.name}
              text={template.name}
              Icon={getIcon(template.iconName)}
              color={getColorFromTemplateName(template.name)}
              onClick={() => {
                form.setValue('icon', template.iconName, {
                  shouldDirty: true,
                  shouldValidate: true,
                  shouldTouch: true,
                });
                form.setValue('name', template.name, {
                  shouldDirty: true,
                  shouldValidate: true,
                  shouldTouch: true,
                });
              }}
            />
          ))}
        </StyledFormContainer>
      </Section> */}
    </SettingsPageContainer>
  );
};
