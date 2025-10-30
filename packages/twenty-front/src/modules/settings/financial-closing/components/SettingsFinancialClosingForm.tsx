import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { useBillingModelTranslations } from '@/settings/financial-closing/constants/BillingModelOptions';
import { type FinancialClosing } from '@/settings/financial-closing/types/FinancialClosing';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';

const financialClosingMetadataFormSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name is required'),
  lastDayMonth: z.boolean().default(false),

  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido'), // formato HH:mm
  day: z.number(),

  billingModelIds: z
    .array(z.string())
    .nonempty('At least one billing model ID is required'),
  workspaceId: z.string(),
});

export const FinancialClosingFormSchema =
  financialClosingMetadataFormSchema.pick({
    name: true,
    day: true,
    lastDayMonth: true,
    time: true,
    billingModelIds: true,
    workspaceId: true,
  });

export type FinancialClosingFormValues = z.infer<
  typeof financialClosingMetadataFormSchema
>;

type SettingsFinancialClosingFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  activeFinancialClosing?: FinancialClosing | undefined;
};

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledSectionDateInputs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsFinancialClosingForm = ({
  disabled,
  disableNameEdit,
  activeFinancialClosing,
}: SettingsFinancialClosingFormProps) => {
  const { control, reset } = useFormContext<FinancialClosingFormValues>();
  const { t } = useLingui();
  const { getBillingModelOptions } = useBillingModelTranslations();

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (activeFinancialClosing) {
      reset({
        id: activeFinancialClosing.id ?? '',
        name: activeFinancialClosing.name ?? '',
        lastDayMonth: activeFinancialClosing.lastDayMonth ?? false,
        // lastDayMonth: false, // Sempre false - campo desabilitado
        day: activeFinancialClosing.day,
        time: activeFinancialClosing.time ?? '00:00',
        billingModelIds: activeFinancialClosing.billingModelIds ?? [],
        workspaceId: activeFinancialClosing.workspace.id ?? '',
      });
    }
  }, [activeFinancialClosing, reset]);

  return (
    <Section>
      <StyledInputsContainer>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label={t`Name`}
              placeholder={t`Enter the name of the closing`}
              value={value}
              onChange={onChange}
              disabled={disabled || disableNameEdit}
              fullWidth
              maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
            />
          )}
        />

        <Controller
          name="billingModelIds"
          control={control}
          render={({ field: { onChange } }) => {
            return (
              <FormMultiSelectFieldInput
                key={activeFinancialClosing?.id}
                label={t`Select the billing models`}
                options={getBillingModelOptions()}
                defaultValue={activeFinancialClosing?.billingModelIds ?? []}
                onChange={onChange}
              />
            );
          }}
        />

        <StyledSectionDateInputs>
          <Controller
            name="time"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                type="time"
                label={t`Time`}
                value={value}
                onChange={onChange}
                disabled={disabled}
              />
            )}
          />

          <Controller
            control={control}
            name="day"
            render={({ field }) => (
              <Select
                fullWidth
                disabled={false}
                dropdownId="dayClosing"
                label={t`Closing Day`}
                options={[
                  { label: t`Select the day...`, value: null },
                  ...Array.from({ length: 30 }, (_, i) => ({
                    label: String(i + 1),
                    value: i + 1,
                  })),
                ]}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        </StyledSectionDateInputs>

        {/* <Controller            
          name="lastDayMonth"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox
                checked={value}
                onCheckedChange={onChange}
                disabled={false}
              />
              <label>{t`Last day of the month`}</label>
            </div>
          )}
        /> */}
      </StyledInputsContainer>
    </Section>
  );
};
