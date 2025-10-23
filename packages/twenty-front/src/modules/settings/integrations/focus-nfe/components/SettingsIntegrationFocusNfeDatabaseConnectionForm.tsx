/* eslint-disable react/jsx-props-no-spreading */
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { applyMask } from 'twenty-shared/utils';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { type SettingsIntegrationFocusNfeConnectionFormValues } from '~/pages/settings/integrations/focus-nfe/SettingsIntegrationFocusNfeNewConnection';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: 15px;
  width: 100%;
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledHalfWidthInput = styled.div`
  width: 50%;
`;

const StyledFormFieldContainer = styled.div<{ width?: string }>`
  width: ${({ width = '100%' }) => width};
`;

const StyledFormTitle = styled.h4`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledAddressGroupContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

type SettingsIntegrationFocusNfeDatabaseConnectionFormProps = {
  disabled?: boolean;
  objectMetadataItem?: ObjectMetadataItem;
};

type MaskedFieldControllerProps = {
  name: keyof SettingsIntegrationFocusNfeConnectionFormValues;
  control: any;
  validation?: any;
  label: string;
  disabled?: boolean;
  uppercase?: boolean;
};

const MaskedFieldController = ({
  name,
  control,
  validation,
  label,
  disabled,
  uppercase = false,
}: MaskedFieldControllerProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleChange = (newValue: string) => {
          if (!validation?.mask) {
            onChange(uppercase ? newValue.toUpperCase() : newValue);
            return;
          }

          const processedValue = uppercase
            ? newValue.toUpperCase()
            : newValue;
          const masked = applyMask(processedValue, validation.mask);

          onChange(masked);
        };

        return (
          <TextInput
            label={label}
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            placeholder={
              validation?.placeholder || `Enter ${label.toLowerCase()}`
            }
            fullWidth
            error={error?.message}
          />
        );
      }}
    />
  );
};

export const SettingsIntegrationFocusNfeDatabaseConnectionForm = ({
  disabled,
  objectMetadataItem,
}: SettingsIntegrationFocusNfeDatabaseConnectionFormProps) => {
  const { control } =
    useFormContext<SettingsIntegrationFocusNfeConnectionFormValues>();
  const [showingMasked, setShowingMasked] = useState(true);

  const fieldValidations = useMemo(() => {
    if (!objectMetadataItem) return {};

    const validationMap: Record<string, any> = {};
    objectMetadataItem.fields.forEach((field) => {
      if (field.settings?.validation) {
        validationMap[field.name] = field.settings.validation;
      }
    });
    return validationMap;
  }, [objectMetadataItem]);

  const taxRegimeOptions = [
    { value: '', label: 'Select a tax regime' },
    { value: 'simples_nacional', label: 'Simples Nacional' },
    { value: 'lucro_presumido', label: 'Lucro Presumido' },
    { value: 'lucro_real', label: 'Lucro Real' },
  ];

  return (
    <StyledFormContainer>
      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                label="Integration name"
                value={value}
                onChange={onChange}
                type="text"
                disabled={disabled}
                placeholder="Focus Nfe"
                fullWidth
                error={error?.message}
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>

      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name="token"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                label="Token"
                value={showingMasked && value ? '********' : value}
                onChange={onChange}
                onFocus={() => setShowingMasked(false)}
                onBlur={() => setShowingMasked(true)}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="************************"
                error={error?.message}
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>

      <StyledFormContainer>
        <StyledFormTitle>Issuer data</StyledFormTitle>

        <StyledFormFieldContainer>
          <Controller
            name="companyName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextInput
                label="Issuer name (company name)"
                {...field}
                disabled={disabled}
                placeholder="Focus NFe"
                fullWidth
                error={error?.message}
              />
            )}
          />
        </StyledFormFieldContainer>

        <StyledRow>
          <StyledFormFieldContainer width="50%">
            <MaskedFieldController
              name="cnpj"
              control={control}
              validation={fieldValidations.cnpj}
              label="CNPJ"
              disabled={disabled}
            />
          </StyledFormFieldContainer>

          <StyledFormFieldContainer width="50%">
            <MaskedFieldController
              name="cpf"
              control={control}
              validation={fieldValidations.cpf}
              label="CPF"
              disabled={disabled}
            />
          </StyledFormFieldContainer>
        </StyledRow>

        <StyledRow>
          <StyledFormFieldContainer width="50%">
            <MaskedFieldController
              name="ie"
              control={control}
              validation={fieldValidations.ie}
              label="IE"
              disabled={disabled}
            />
          </StyledFormFieldContainer>

          <StyledFormFieldContainer width="50%">
            <MaskedFieldController
              name="inscricaoMunicipal"
              control={control}
              validation={fieldValidations.inscricaoMunicipal}
              label="Inscrição Municipal"
              disabled={disabled}
            />
          </StyledFormFieldContainer>
        </StyledRow>

        <StyledFormFieldContainer>
          <MaskedFieldController
            name="cnaeCode"
            control={control}
            validation={fieldValidations.cnaeCode}
            label="CNAE Code"
            disabled={disabled}
          />
        </StyledFormFieldContainer>

        <StyledAddressGroupContainer>
          <StyledFormFieldContainer>
            <MaskedFieldController
              name="cep"
              control={control}
              validation={fieldValidations.cep}
              label="CEP"
              disabled={disabled}
            />
          </StyledFormFieldContainer>

          <StyledRow>
            <StyledFormFieldContainer width="80%">
              <Controller
                name="street"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    label="Street"
                    {...field}
                    disabled={disabled}
                    placeholder="Add street"
                    fullWidth
                    error={error?.message}
                  />
                )}
              />
            </StyledFormFieldContainer>

            <StyledFormFieldContainer width="20%">
              <Controller
                name="number"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    label="Number"
                    {...field}
                    disabled={disabled}
                    placeholder="Add number"
                    fullWidth
                    error={error?.message}
                  />
                )}
              />
            </StyledFormFieldContainer>
          </StyledRow>

          <StyledRow>
            <StyledFormFieldContainer width="45%">
              <Controller
                name="neighborhood"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    label="Neighborhood"
                    {...field}
                    disabled={disabled}
                    placeholder="Add neighborhood"
                    fullWidth
                    error={error?.message}
                  />
                )}
              />
            </StyledFormFieldContainer>

            <StyledFormFieldContainer width="45%">
              <Controller
                name="city"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    label="City"
                    {...field}
                    disabled={disabled}
                    placeholder="Add city"
                    fullWidth
                    error={error?.message}
                  />
                )}
              />
            </StyledFormFieldContainer>

            <StyledFormFieldContainer width="10%">
              <MaskedFieldController
                name="state"
                control={control}
                validation={fieldValidations.state}
                label="State"
                disabled={disabled}
                uppercase
              />
            </StyledFormFieldContainer>
          </StyledRow>
        </StyledAddressGroupContainer>

        <StyledFormFieldContainer>
          <Controller
            name="taxRegime"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Select
                dropdownId={field.name}
                label="Tax regime"
                {...field}
                disabled={disabled}
                fullWidth
                options={taxRegimeOptions}
                emptyOption={taxRegimeOptions[0]}
              />
            )}
          />
        </StyledFormFieldContainer>
      </StyledFormContainer>
    </StyledFormContainer>
  );
};