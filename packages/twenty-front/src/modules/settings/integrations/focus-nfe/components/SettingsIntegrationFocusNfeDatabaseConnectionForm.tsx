import styled from '@emotion/styled';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MaskedTextInput } from '@/ui/input/components/MaskedTextInput';
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

// Helper function to get field validation - no useMemo needed
const getFieldValidation = (
  objectMetadataItem: ObjectMetadataItem | undefined,
  fieldName: string,
) => {
  if (!objectMetadataItem) return undefined;

  const field = objectMetadataItem.fields.find((f) => f.name === fieldName);
  return field?.settings?.validation;
};

export const SettingsIntegrationFocusNfeDatabaseConnectionForm = ({
  disabled,
  objectMetadataItem,
}: SettingsIntegrationFocusNfeDatabaseConnectionFormProps) => {
  const { control } =
    useFormContext<SettingsIntegrationFocusNfeConnectionFormValues>();
  const [showingMasked, setShowingMasked] = useState(true);

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
            <Controller
              name="cnpj"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                const validation = getFieldValidation(
                  objectMetadataItem,
                  'cnpj',
                );

                return (
                  <MaskedTextInput
                    label="CNPJ"
                    value={value}
                    onChange={onChange}
                    mask={validation?.mask}
                    placeholder={validation?.placeholder || 'Enter CNPJ'}
                    disabled={disabled}
                    fullWidth
                    error={error?.message}
                  />
                );
              }}
            />
          </StyledFormFieldContainer>

          <StyledFormFieldContainer width="50%">
            <Controller
              name="cpf"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                const validation = getFieldValidation(
                  objectMetadataItem,
                  'cpf',
                );

                return (
                  <MaskedTextInput
                    label="CPF"
                    value={value}
                    onChange={onChange}
                    mask={validation?.mask}
                    placeholder={validation?.placeholder || 'Enter CPF'}
                    disabled={disabled}
                    fullWidth
                    error={error?.message}
                  />
                );
              }}
            />
          </StyledFormFieldContainer>
        </StyledRow>

        <StyledRow>
          <StyledFormFieldContainer width="50%">
            <Controller
              name="ie"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                const validation = getFieldValidation(objectMetadataItem, 'ie');

                return (
                  <MaskedTextInput
                    label="IE"
                    value={value}
                    onChange={onChange}
                    mask={validation?.mask}
                    placeholder={validation?.placeholder || 'Enter IE'}
                    disabled={disabled}
                    fullWidth
                    error={error?.message}
                  />
                );
              }}
            />
          </StyledFormFieldContainer>

          <StyledFormFieldContainer width="50%">
            <Controller
              name="inscricaoMunicipal"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                const validation = getFieldValidation(
                  objectMetadataItem,
                  'inscricaoMunicipal',
                );

                return (
                  <MaskedTextInput
                    label="Inscrição Municipal"
                    value={value}
                    onChange={onChange}
                    mask={validation?.mask}
                    placeholder={
                      validation?.placeholder || 'Enter Municipal Registration'
                    }
                    disabled={disabled}
                    fullWidth
                    error={error?.message}
                  />
                );
              }}
            />
          </StyledFormFieldContainer>
        </StyledRow>

        <StyledFormFieldContainer>
          <Controller
            name="cnaeCode"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const validation = getFieldValidation(
                objectMetadataItem,
                'cnaeCode',
              );

              return (
                <MaskedTextInput
                  label="CNAE Code"
                  value={value}
                  onChange={onChange}
                  mask={validation?.mask}
                  placeholder={validation?.placeholder || 'Enter CNAE Code'}
                  disabled={disabled}
                  fullWidth
                  error={error?.message}
                />
              );
            }}
          />
        </StyledFormFieldContainer>

        <StyledAddressGroupContainer>
          <StyledFormFieldContainer>
            <Controller
              name="cep"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                const validation = getFieldValidation(
                  objectMetadataItem,
                  'cep',
                );

                return (
                  <MaskedTextInput
                    label="CEP"
                    value={value}
                    onChange={onChange}
                    mask={validation?.mask}
                    placeholder={validation?.placeholder || 'Enter CEP'}
                    disabled={disabled}
                    fullWidth
                    error={error?.message}
                  />
                );
              }}
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
              <Controller
                name="state"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => {
                  const validation = getFieldValidation(
                    objectMetadataItem,
                    'state',
                  );

                  return (
                    <MaskedTextInput
                      label="State"
                      value={value}
                      onChange={onChange}
                      mask={validation?.mask}
                      placeholder={validation?.placeholder || 'UF'}
                      disabled={disabled}
                      uppercase
                      fullWidth
                      error={error?.message}
                    />
                  );
                }}
              />
            </StyledFormFieldContainer>
          </StyledRow>
        </StyledAddressGroupContainer>

        <StyledFormFieldContainer>
          <Controller
            name="taxRegime"
            control={control}
            render={({ field }) => (
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
