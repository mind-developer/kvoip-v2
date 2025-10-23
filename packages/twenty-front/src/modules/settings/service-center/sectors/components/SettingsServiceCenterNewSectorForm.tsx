import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { type NewSectorFormValues } from '@/settings/service-center/sectors/validation-schemas/newSectorFormSchema';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, Label } from 'twenty-ui/display';
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
      <StyledSection>
        <H2Title
          title={t`Abandonment Interval`}
          description={t`Chats will be moved to the "Abandoned" inbox after this interval if a client hasn't been answered yet.`}
        />
        <Controller
          name="abandonmentInterval"
          control={form.control}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChange={(value) => {
                const numberValue = Number(value);
                if (numberValue > 60) {
                  return;
                }
                field.onChange(numberValue);
              }}
              label={t`Interval in minutes (max. 60)`}
              minLength={2}
              maxLength={2}
            />
          )}
        />
      </StyledSection>
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
