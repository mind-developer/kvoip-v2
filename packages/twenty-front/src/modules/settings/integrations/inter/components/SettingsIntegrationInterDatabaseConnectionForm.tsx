/* eslint-disable prettier/prettier */
import styled from '@emotion/styled';
/* @kvoip-woulz proprietary:begin */
import { useEffect, useRef, useState } from 'react';
/* @kvoip-woulz proprietary:end */
import { Controller, useFormContext } from 'react-hook-form';
/* @kvoip-woulz proprietary:begin */
import { applyMask } from 'twenty-shared/utils';
/* @kvoip-woulz proprietary:end */

import { FileDropZone } from '@/settings/integrations/inter/components/FileDropZone';
import { TextInput } from '@/ui/input/components/TextInput';
import { SettingsIntegrationInterConnectionFormValues } from '~/pages/settings/integrations/inter/SettingsIntegrationInterNewDatabaseConnection';

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

const StyledFullWidthInput = styled.div`
  width: 100%;
`;

const StyledHalfWidthInput = styled.div`
  width: 50%;
`;

type SettingsIntegrationInterDatabaseConnectionFormProps = {
  disabled?: boolean;
};

/* @kvoip-woulz proprietary:begin */
type MaskedFieldControllerProps = {
  name: keyof SettingsIntegrationInterConnectionFormValues;
  control: any;
  mask?: string;
  label: string;
  disabled?: boolean;
  placeholder?: string;
};

const MaskedFieldController = ({
  name,
  control,
  mask,
  label,
  disabled,
  placeholder,
}: MaskedFieldControllerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const cursorPosRef = useRef<number>(0);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const updateCursorPosition = () => {
          if (inputRef.current) {
            cursorPosRef.current = inputRef.current.selectionStart || 0;
          }
        };

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (inputRef.current && mask) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
          }
        }, [value]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const inputElement = inputRef.current;
          if (!inputElement) return;

          const handleClick = () => updateCursorPosition();
          const handleMouseUp = () => updateCursorPosition();
          const handlePaste = () => {
            // For paste, update cursor position after a short delay
            setTimeout(() => updateCursorPosition(), 0);
          };

          inputElement.addEventListener('click', handleClick);
          inputElement.addEventListener('mouseup', handleMouseUp);
          inputElement.addEventListener('paste', handlePaste);

          return () => {
            inputElement.removeEventListener('click', handleClick);
            inputElement.removeEventListener('mouseup', handleMouseUp);
            inputElement.removeEventListener('paste', handlePaste);
          };
        }, []);

        const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
          updateCursorPosition();
        };

        const handleChange = (newValue: string) => {
          if (!mask) {
            onChange(newValue);
            return;
          }

          const previousLength = (value || '').length;
          const masked = applyMask(newValue, mask);
          const newLength = masked.length;

          if (newLength > previousLength) {
            setCursorPosition(cursorPosRef.current + (newLength - previousLength));
          } else {
            setCursorPosition(cursorPosRef.current);
          }

          onChange(masked);
        };

        return (
          <TextInput
            ref={inputRef}
            label={label}
            value={value || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            fullWidth
            error={error?.message}
          />
        );
      }}
    />
  );
};
/* @kvoip-woulz proprietary:end */

export const SettingsIntegrationInterDatabaseConnectionForm = ({
  disabled,
}: SettingsIntegrationInterDatabaseConnectionFormProps) => {
  const { control, watch, setValue } =
    useFormContext<SettingsIntegrationInterConnectionFormValues>();

  return (
    <StyledFormContainer>
      <StyledRow>
        <Controller
          name="integrationName"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Integration name"
              value={value as string}
              onChange={onChange}
              type="text"
              disabled={disabled}
              placeholder="Banco Inter"
              fullWidth
            />
          )}
        />
      </StyledRow>

      <StyledRow>
        <StyledHalfWidthInput>
          {/* @kvoip-woulz proprietary:begin */}
          <MaskedFieldController
            name="currentAccount"
            control={control}
            mask="99999999-99"
            label="Current account"
            disabled={disabled}
            placeholder="00000000-00"
          />
          {/* @kvoip-woulz proprietary:end */}
        </StyledHalfWidthInput>

        <StyledHalfWidthInput>
          <Controller
            name="expirationDate"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Expiration Date"
                type="date"
                value={
                  field.value
                    ? new Date(field.value).toISOString().split('T')[0]
                    : ''
                }
                onChange={(value) => {
                  field.onChange(value ? new Date(value) : null);
                }}
                disabled={disabled}
                fullWidth
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>

      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name="clientId"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Client ID"
                value={value as string}
                onChange={onChange}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="********_****_****_****_****"
              />
            )}
          />
        </StyledHalfWidthInput>

        <StyledHalfWidthInput>
          <Controller
            name="clientSecret"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                autoComplete="new-password"
                label="Client Secret"
                value={value as string}
                onChange={onChange}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="********_****_****_****_****"
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>

      <StyledRow>
        <StyledFullWidthInput>
          <FileDropZone
            label="Private Key"
            accept=".pem,.key"
            file={watch('privateKey')}
            onFileSelected={(file) => setValue('privateKey', file)}
            onFileRemoved={() => setValue('privateKey', undefined)}
            disabled={disabled}
          />
        </StyledFullWidthInput>
      </StyledRow>

      <StyledRow>
        <StyledFullWidthInput>
          <FileDropZone
            label="Certificate"
            accept=".pem,.crt,.cer"
            file={watch('certificate')}
            onFileSelected={(file) => setValue('certificate', file)}
            onFileRemoved={() => setValue('certificate', undefined)}
            disabled={disabled}
          />
        </StyledFullWidthInput>
      </StyledRow>
    </StyledFormContainer>
  );
};
