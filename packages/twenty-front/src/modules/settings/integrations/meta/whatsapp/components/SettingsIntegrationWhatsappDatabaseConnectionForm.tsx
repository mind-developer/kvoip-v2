import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { Select } from '@/ui/input/components/Select';
import {
  IconBrandMeta,
  IconDeviceMobileMessage,
  IconUserScan,
} from '@tabler/icons-react';
import { useEffect } from 'react';
import { useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type SettingsIntegrationWhatsappConnectionFormValues } from '~/pages/settings/integrations/whatsapp/SettingsIntegrationWhatsappNewDatabaseConnection';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

type SettingsIntegrationWhatsappDatabaseConnectionFormProps = {
  disabled?: boolean;
  sectors?: (Omit<Sector, 'icon'> & {
    __typename: string;
    icon: string;
  })[];
  editableFields?: string[];
};

const apiTypeOptions: SelectOption<string>[] = [
  {
    Icon: IconDeviceMobileMessage,
    label: 'Baileys',
    value: 'Baileys',
  },
  {
    Icon: IconBrandMeta,
    label: 'MetaAPI',
    value: 'MetaAPI',
  },
];

const getFormFields = (
  sectorOptions: SelectOption[],
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
      name: 'sectorId',
      label: 'Default sector (members will receive all new messages)',
      placeholder: 'Select a sector',
      isSelect: true,
      options: sectorOptions,
      showForBaileys: true,
      showForMetaAPI: true,
    },
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
  sectors = [],
  editableFields,
}: SettingsIntegrationWhatsappDatabaseConnectionFormProps) => {
  const { getIcon } = useIcons();
  const { control, watch, setValue } =
    useFormContext<SettingsIntegrationWhatsappConnectionFormValues>();
  const selectedApiType = watch('apiType');

  const sectorOptions: SelectOption[] =
    sectors.length > 0
      ? sectors.map((sector) => ({
          Icon: sector.icon ? getIcon(sector.icon) : IconUserScan,
          label: sector.name,
          value: sector.id,
        }))
      : [
          {
            Icon: IconUserScan,
            label: 'No sectors available',
            value: 'no-sectors',
            disabled: true,
          },
        ];

  const formFields = getFormFields(sectorOptions);
  useEffect(() => {
    if (selectedApiType === 'Baileys') {
      setValue('phoneId', '');
      setValue('businessAccountId', '');
      setValue('accessToken', '');
      setValue('appId', '');
      setValue('appKey', '');
    }
  }, [selectedApiType, setValue]);

  // Set default sector when sectors are loaded
  useEffect(() => {
    if (sectors.length > 0) {
      const currentSectorId = watch('sectorId');
      if (!currentSectorId || currentSectorId === '') {
        setValue('sectorId', sectors[0].id);
      }
    }
  }, [sectors, setValue, watch]);

  if (!formFields) return null;

  const visibleFields = formFields.filter((field) => {
    if (!selectedApiType) return true;
    if (selectedApiType === 'Baileys') return field.showForBaileys;
    if (selectedApiType === 'MetaAPI') return field.showForMetaAPI;
    return true;
  });

  const isFieldEditable = (fieldName: string): boolean => {
    if (editableFields === undefined) {
      // If editableFields is not provided, use the disabled prop
      return !disabled;
    }
    // If editableFields is provided, only allow editing if field is in the list
    return editableFields.includes(fieldName);
  };

  return (
    <StyledInputsContainer>
      {visibleFields.map(
        ({ name, label, type, placeholder, isSelect, options }) => {
          const fieldDisabled = !isFieldEditable(name);
          return (
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
                      dropdownId={`api-type-select-${name}`}
                      fullWidth
                      disabled={fieldDisabled}
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
                    disabled={fieldDisabled}
                    placeholder={placeholder}
                  />
                );
              }}
            />
          );
        },
      )}
    </StyledInputsContainer>
  );
};
