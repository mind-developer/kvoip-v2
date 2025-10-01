import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Select } from '@/ui/input/components/Select';
import { IconInbox } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { SelectOption } from 'twenty-ui/input';
import { Inbox } from '~/generated/graphql';
import { SettingsIntegrationWhatsappConnectionFormValues } from '~/pages/settings/integrations/whatsapp/SettingsIntegrationWhatsappNewDatabaseConnection';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

type SettingsIntegrationWhatsappDatabaseConnectionFormProps = {
  disabled?: boolean;
};

const apiTypeOptions: SelectOption<string>[] = [
  {
    label: 'Baileys',
    value: 'Baileys',
  },
  {
    label: 'MetaAPI',
    value: 'MetaAPI',
  },
];

const getFormFields = (
  inboxes: Inbox[],
): {
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
      name: 'apiType',
      label: 'API Type',
      placeholder: 'Select API Type',
      isSelect: true,
      options: apiTypeOptions,
      showForBaileys: true,
      showForMetaAPI: true,
    },
    {
      name: 'inboxToAssignTo',
      placeholder: 'Inbox',
      label: 'Assign to Inbox',
      isSelect: true,
      options:
        inboxes.length > 0
          ? inboxes.map((inbox) => ({
              label: inbox.name,
              value: inbox.id,
              Icon: IconInbox,
            }))
          : [{ label: 'You have no inboxes set up.', value: '' }],
      showForBaileys: true,
      showForMetaAPI: true,
    },
    {
      name: 'name',
      label: 'Integration name',
      placeholder: 'Name',
      type: 'text',
      showForBaileys: true,
      showForMetaAPI: true,
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
  const selectedApiType = watch('apiType');
  const [inbox, selectedInbox] = useState<Inbox>();
  const { records: inboxes } = useFindManyRecords<Inbox>({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });
  const formFields = getFormFields(inboxes);
  //
  // Auto-preenchimento dos campos ocultos para Baileys
  useEffect(() => {
    if (selectedApiType === 'Baileys') {
      setValue('phoneId', 'Baileys');
      setValue('businessAccountId', 'Baileys');
      setValue('accessToken', 'Baileys');
      setValue('appId', 'Baileys');
      setValue('appKey', 'Baileys');
    }
  }, [selectedApiType, setValue]);

  if (!formFields) return null;

  const visibleFields = formFields.filter((field) => {
    if (!selectedApiType) return true; // Mostrar todos se nenhum tipo selecionado
    if (selectedApiType === 'Baileys') return field.showForBaileys;
    if (selectedApiType === 'MetaAPI') return field.showForMetaAPI;
    return true;
  });

  return (
    <StyledInputsContainer>
      {visibleFields.map(
        ({ name, label, type, placeholder, isSelect, options }) => (
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
                <TextInput
                  autoComplete="new-password"
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
        ),
      )}
    </StyledInputsContainer>
  );
};
