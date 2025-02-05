import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { SettingsIntegrationInterConnectionFormValues } from '~/pages/settings/integrations/inter/SettingsIntegrationInterNewDatabaseConnection';

const StyledInputsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2, 4)};
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'input-1 input-1'
    'input-2 input-3'
    'input-4 input-5';

  & :first-of-type {
    grid-area: input-1;
  }
`;

type SettingsIntegrationInterDatabaseConnectionFormProps = {
  disabled?: boolean;
};

const getFormFields = (): {
  name: keyof SettingsIntegrationInterConnectionFormValues;
  label: string;
  type?: string;
  placeholder: string;
}[] => {
  return [
    {
      name: 'label',
      label: 'Integration name',
      placeholder: 'Integration name',
      type: 'text',
    },
    {
      name: 'client_id',
      label: 'Client ID',
      placeholder: 'ClientID',
      type: 'text',
    },
    {
      name: 'client_secret',
      label: 'Client ID',
      placeholder: 'ClientID',
      type: 'text',
    },
    {
      name: 'key_file',
      label: 'Key file',
      placeholder: '',
      type: 'file',
    },
    {
      name: 'crt_file',
      label: 'Certificate file',
      placeholder: '',
      type: 'file',
    },
  ];
};

export const SettingsIntegrationInterDatabaseConnectionForm = ({
  disabled,
}: SettingsIntegrationInterDatabaseConnectionFormProps) => {
  const { control } =
    useFormContext<SettingsIntegrationInterConnectionFormValues>();
  const formFields = getFormFields();

  if (!formFields) return null;

  return (
    <StyledInputsContainer>
      {formFields.map(({ name, label, type, placeholder }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <TextInputV2
                autoComplete="new-password" // Disable autocomplete
                label={label}
                value={value}
                onChange={onChange}
                fullWidth
                type={type}
                disabled={disabled}
                placeholder={placeholder}
              />
            );
          }}
        />
      ))}
    </StyledInputsContainer>
  );
};
