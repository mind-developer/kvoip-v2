import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';

const financialClosingMetadataFormSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name is required'),
  lastDayMonth: z.boolean(),
  
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido'), // formato HH:mm
  day: z.number(),

  billingModelIds: z.array(z.string()).nonempty('At least one billing model ID is required'),
});

export const FinancialClosingFormSchema = financialClosingMetadataFormSchema.pick({
  name: true,
  day: true,
  lastDayMonth: true,
  time: true,
  billingModelIds: true,
});

export type FinancialClosingFormValues = z.infer<
  typeof financialClosingMetadataFormSchema
>;

type SettingsFinancialClosingFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  activeName?: string; 
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
  activeName,
}: SettingsFinancialClosingFormProps) => {
  const { control, reset } = useFormContext<FinancialClosingFormValues>();

  useEffect(() => {
    if (activeName) {
      reset({ name: activeName });
    }
  }, [activeName, reset]);

  return (
    <Section>
      <StyledInputsContainer>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label={'Nome'}
              placeholder={'Entre com o nome do fechamento'}
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
                label="Selecione os modelos de cobrança"
                options={[
                  { label: 'Pré-Pago', value: 'pre-pago' },
                  { label: 'Pós-Pago', value: 'pos-pago' },
                  { label: 'Pré-Ilimitado', value: 'pre-ilimitado' },
                  { label: 'Pós-Ilimitado', value: 'pos-ilimitado' },
                ]}
                defaultValue={''}
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
                label="Horário"
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
                label={'Dia de Fechamento'}
                options={[
                  { label: 'Selecione o dia...', value: null },
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

        <Controller            
          name="lastDayMonth"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox
                checked={value}
                onCheckedChange={onChange}
                disabled={disabled}
              />
              <label>Último dia do mês</label>
            </div>
          )}
        />

      </StyledInputsContainer>
    </Section>
  );
};
