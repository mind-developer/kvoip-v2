/* eslint-disable react/jsx-props-no-spreading */

import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { useState } from 'react';
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
  margin-top: ${({ theme }) =>
    theme.spacing(2)}; // Spacing before address group
`;

type SettingsIntegrationFocusNfeDatabaseConnectionFormProps = {
  disabled?: boolean;
};

export const SettingsIntegrationFocusNfeDatabaseConnectionForm = ({
  disabled,
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

  // TODO: Add masks for CNPJ, CPF, CEP, IE, CNAE if available/needed
  // For now, they are simple text inputs.

  return (
    <StyledFormContainer>
      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Integration name"
                value={value as string}
                onChange={onChange}
                type="text"
                disabled={disabled}
                placeholder="Focus Nfe"
                fullWidth
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
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Token"
                value={showingMasked && value ? '********' : value}
                onChange={onChange}
                onFocus={() => {
                  if (showingMasked) {
                    setShowingMasked(false);
                  }
                }}
                onBlur={() => {
                  if (!showingMasked) {
                    setShowingMasked(true);
                  }
                }}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="************************"
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
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  label="CNPJ"
                  {...field}
                  disabled={disabled}
                  placeholder="99.999.999/9999-99"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
          <StyledFormFieldContainer width="50%">
            <Controller
              name="cpf"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  label="CPF"
                  {...field}
                  disabled={disabled}
                  placeholder="999.999.999-99"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
        </StyledRow>

        <StyledRow>
          <StyledFormFieldContainer width="50%">
            <Controller
              name="ie"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  label="IE"
                  {...field}
                  disabled={disabled}
                  placeholder="Add number"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
          <StyledFormFieldContainer width="50%">
            <Controller
              name="inscricaoMunicipal"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  label="Inscrição Municipal"
                  {...field}
                  disabled={disabled}
                  placeholder="Inscrição Municipal"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
        </StyledRow>
        <StyledFormFieldContainer>
          <Controller
            name="cnaeCode"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextInput
                label="CNAE Code"
                {...field}
                disabled={disabled}
                placeholder="****-*/ **"
                fullWidth
                error={error?.message}
              />
            )}
          />
        </StyledFormFieldContainer>
        <StyledAddressGroupContainer>
          {/* <StyledFormTitle>Address</StyledFormTitle> No separate title in image for address group */}
          <StyledFormFieldContainer>
            <Controller
              name="cep"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  label="CEP"
                  {...field}
                  disabled={disabled}
                  placeholder="99.999-999"
                  fullWidth
                  error={error?.message}
                />
              )}
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
            <StyledFormFieldContainer width="calc(45% - (${({ theme }) => theme.spacing(4)} / 3 * 2))">
              {' '}
              {/* Adjust for gap */}
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
            <StyledFormFieldContainer width="calc(45% - (${({ theme }) => theme.spacing(4)} / 3 * 2))">
              {' '}
              {/* Adjust for gap */}
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
            <StyledFormFieldContainer width="calc(10% - (${({ theme }) => theme.spacing(4)} / 3 * 1))">
              {' '}
              {/* Adjust for gap */}
              <Controller
                name="state"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    label="State"
                    {...field}
                    disabled={disabled}
                    placeholder="UF"
                    fullWidth
                    error={error?.message}
                  />
                )}
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
