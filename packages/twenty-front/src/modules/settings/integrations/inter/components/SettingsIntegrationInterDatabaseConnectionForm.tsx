import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import {
  TEXT_VALIDATION_PATTERNS,
  type TextValidationPattern,
} from 'twenty-shared/utils';

import { FileDropZone } from '@/settings/integrations/inter/components/FileDropZone';
import { MaskedTextInput } from '@/ui/input/components/MaskedTextInput';
import { TextInput } from '@/ui/input/components/TextInput';
import { type SettingsIntegrationInterConnectionFormValues } from '~/pages/settings/integrations/inter/SettingsIntegrationInterNewDatabaseConnection';

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
const INTER_FIELD_VALIDATIONS: Record<
  string,
  { validation: TextValidationPattern }
> = {
  currentAccount: {
    validation: TEXT_VALIDATION_PATTERNS.BR_INTER_ACCOUNT,
  },
};

const getFieldValidation = (
  fieldName: string,
): TextValidationPattern | undefined => {
  const validation = INTER_FIELD_VALIDATIONS[fieldName]?.validation;
  if (fieldName === 'currentAccount' && validation) {
    console.log('Inter currentAccount validation:', validation);
  }
  return validation;
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
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label="Integration name"
              value={value as string}
              onChange={onChange}
              type="text"
              disabled={disabled}
              placeholder="Banco Inter"
              fullWidth
              error={error?.message}
            />
          )}
        />
      </StyledRow>

      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name="currentAccount"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const validation = getFieldValidation('currentAccount');

              return (
                <MaskedTextInput
                  label="Current account"
                  value={value}
                  onChange={onChange}
                  mask={validation?.mask}
                  placeholder={validation?.placeholder || '00000000-00'}
                  disabled={disabled}
                  fullWidth
                  error={error?.message}
                />
              );
            }}
          />
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
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                label="Client ID"
                value={value as string}
                onChange={onChange}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="********_****_****_****_****"
                error={error?.message}
              />
            )}
          />
        </StyledHalfWidthInput>

        <StyledHalfWidthInput>
          <Controller
            name="clientSecret"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                autoComplete="new-password"
                label="Client Secret"
                value={value as string}
                onChange={onChange}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="********_****_****_****_****"
                error={error?.message}
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
