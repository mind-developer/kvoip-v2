import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';

const sectorMetadataFormSchema = z.object({
  id: z.string(),
  icon: z.string(),
  name: z.string().min(3, 'Name is required'),
  abandonmentInterval: z
    .number()
    .min(1, 'Abandonment interval must be at least 10 minutes')
    .max(60, 'Abandonment interval must be less than 60 minutes')
    .default(10)
    .optional(),
});

export const SettingsSectorFormSchema = sectorMetadataFormSchema.pick({
  icon: true,
  name: true,
  abandonmentInterval: true,
});

export type SettingsSectorFormSchemaValues = z.infer<
  typeof sectorMetadataFormSchema
>;

type SettingsServiceCenterSectorAboutFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  activeSector?: Sector | undefined;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SettingsServiceCenterSectorAboutForm = ({
  disabled,
  disableNameEdit,
  activeSector,
}: SettingsServiceCenterSectorAboutFormProps) => {
  const { control, reset } = useFormContext<SettingsSectorFormSchemaValues>();

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (activeSector) {
      reset({
        id: activeSector.id ?? '',
        icon: activeSector.icon ?? 'IconBadge',
        name: activeSector.name ?? '',
        abandonmentInterval: activeSector.abandonmentInterval ?? 10,
      });
    }
  }, [activeSector, reset]);

  return (
    <>
      <Section>
        <StyledInputsContainer>
          <StyledInputContainer>
            <StyledLabel>{'Icon'}</StyledLabel>
            <Controller
              name="icon"
              control={control}
              render={({ field: { onChange, value } }) => (
                <IconPicker
                  disabled={disabled}
                  selectedIconKey={value}
                  onChange={({ iconKey }) => onChange(iconKey)}
                />
              )}
            />
          </StyledInputContainer>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={'Name'}
                placeholder={'Enter the sector name'}
                value={value}
                onChange={onChange}
                disabled={disabled || disableNameEdit}
                fullWidth
                maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
              />
            )}
          />
        </StyledInputsContainer>
      </Section>
      <Section>
        <H2Title
          title={t`Abandonment Interval`}
          description={t`Chats will be moved to the "Abandoned" inbox after this interval if a client hasn't been answered yet.`}
        />
        <Controller
          name="abandonmentInterval"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value?.toString() || ''}
              onChange={(inputValue) => {
                const numberValue = Number(inputValue);
                if (numberValue > 60) {
                  return;
                }
                onChange(numberValue);
              }}
              label={t`Interval in minutes (max. 60)`}
              placeholder="10"
              disabled={disabled}
              type="number"
              min="1"
              max="60"
            />
          )}
        />
      </Section>
    </>
  );
};
