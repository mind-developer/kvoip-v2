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
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled(Label)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsServiceCenterNewSectorForm = () => {
  const { t } = useLingui();
  const form = useFormContext<NewSectorFormValues>();

  return (
    <SettingsPageContainer>
      <Section>
        <H2Title
          title={t`About`}
          description={t`Define this sector's properties. You can assign agents to this sector after you've created it.`}
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
    </SettingsPageContainer>
  );
};
