import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { SettingsIntegrationWhatsappConnectionFormValues } from '~/pages/settings/integrations/whatsapp/SettingsIntegrationWhatsappNewDatabaseConnection';
import { SelectOption } from 'twenty-ui/input';
import { useEffect } from 'react';
import { Select } from '@/ui/input/components/Select';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

type SettingsIntegrationWhatsappDatabaseConnectionFormProps = {
  disabled?: boolean;
};

const tipoApiOptions: SelectOption<string>[] = [
  {
    label: 'Baileys',
    value: 'Baileys',
  },
  {
    label: 'MetaAPI',
    value: 'MetaAPI',
  },
];

const getFormFields = (): {
  name: keyof SettingsIntegrationWhatsappConnectionFormValues;
  label: string;
  type?: string;
  placeholder: string;
  isSelect?: boolean;
  options?: SelectOption<string>[];
  showForBaileys?: boolean;
  showForMetaAPI?: boolean;
}[] => {
  return [
    {
      name: 'tipoApi',
      label: 'API Type',
      placeholder: 'Select API Type',
      isSelect: true,
      options: tipoApiOptions,
      showForBaileys: true,
      showForMetaAPI: true,
    },
    {
      name: 'name',
      label: 'Inbox name',
      placeholder: 'Integration name',
      type: 'text',
      showForBaileys: true,
      showForMetaAPI: true
    },
    {
      name: 'phoneId',
      label: 'Phone ID',
      placeholder: 'Enter the phone number ID obtained from Facebook Developer',
      type: 'text',
      showForBaileys: false,
      showForMetaAPI: true,
    },
    {
      name: 'businessAccountId',
      label: 'Business Account ID',
      placeholder:
        'Enter the Business Account ID obtained from Facebook Developer',
      type: 'text',
      showForBaileys: false,
      showForMetaAPI: true,
    },
    {
      name: 'accessToken',
      label: 'Access Token',
      placeholder: 'Enter the Access Token obtained from Facebook Developer',
      type: 'text',
      showForBaileys: false,
      showForMetaAPI: true,
    },
    {
      name: 'appId',
      label: 'APP ID',
      placeholder: 'Enter the APP ID obtained from Facebook Developer',
      type: 'text',
      showForBaileys: false,
      showForMetaAPI: true,
    },
    {
      name: 'appKey',
      label: 'APP Secret Key',
      placeholder: 'Enter the APP Secret Key obtained from Facebook Developer',
      showForBaileys: false,
      showForMetaAPI: true,
    },
  ];
};

export const SettingsIntegrationWhatsappDatabaseConnectionForm = ({
  disabled,
}: SettingsIntegrationWhatsappDatabaseConnectionFormProps) => {
  const { control, watch, setValue } =
    useFormContext<SettingsIntegrationWhatsappConnectionFormValues>();
  const formFields = getFormFields();
  const selectedTipoApi = watch('tipoApi');
  const inboxName = watch('name');
  //
  // Auto-preenchimento dos campos ocultos para Baileys
  useEffect(() => {
    if (selectedTipoApi === 'Baileys' && inboxName) {
      setValue('phoneId', inboxName);
      setValue('businessAccountId', inboxName);
      setValue('accessToken', inboxName);
      setValue('appId', inboxName);
      setValue('appKey', inboxName);
    }

  }, [selectedTipoApi, inboxName, setValue]);

  if (!formFields) return null;

  const visibleFields = formFields.filter(field => {
    if (!selectedTipoApi) return true; // Mostrar todos se nenhum tipo selecionado
    if (selectedTipoApi === 'Baileys') return field.showForBaileys;
    if (selectedTipoApi === 'MetaAPI') return field.showForMetaAPI;
    return true;
  });

  return (
    <StyledInputsContainer>
      {visibleFields.map(({ name, label, type, placeholder, isSelect, options }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => {
            if (isSelect && options) {
              return (
                <Select
                  label={label}
                  value={value}
                  onChange={onChange}
                  options={options}
                  dropdownId={`tipo-api-select-${name}`}
                  fullWidth
                  disabled={disabled}
                />
              );
            }
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
