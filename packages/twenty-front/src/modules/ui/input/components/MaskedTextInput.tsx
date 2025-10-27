/* @kvoip-woulz proprietary */
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { forwardRef, useEffect } from 'react';
import { useMaskedInput } from '../hooks/useMaskedInput';

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledTextInputWrapper = styled.div<{ hasError?: boolean }>`
  input {
    border-color: ${({ theme, hasError }) =>
      hasError ? `${theme.color.red} !important` : undefined};

    &:focus {
      border-color: ${({ theme, hasError }) =>
        hasError ? `${theme.color.red} !important` : undefined};
    }
  }
`;

const StyledError = styled.span`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export type MaskedTextInputProps = {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  mask?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: string;
  uppercase?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  required?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  dataTestId?: string;
};

export const MaskedTextInput = forwardRef<
  HTMLInputElement,
  MaskedTextInputProps
>(
  (
    {
      label,
      value,
      onChange,
      mask,
      placeholder,
      disabled,
      fullWidth,
      error,
      uppercase = false,
      onKeyDown,
      onBlur,
      onFocus,
      autoFocus,
      required,
      readOnly,
      tabIndex,
      dataTestId,
    },
    externalRef,
  ) => {
    const { inputRef, handleChange, handleKeyDown, displayValue } =
      useMaskedInput({
        value,
        mask,
        uppercase,
        onChange,
      });

    useEffect(() => {
      if (typeof externalRef === 'function') {
        externalRef(inputRef.current);
      } else if (externalRef) {
        externalRef.current = inputRef.current;
      }
    }, [externalRef, inputRef]);

    if (!mask) {
      return (
        <StyledContainer fullWidth={fullWidth}>
          <TextInput
            ref={externalRef}
            label={label}
            value={value ?? ''}
            onChange={(newValue) => {
              const processedValue = uppercase
                ? newValue.toUpperCase()
                : newValue;
              onChange(processedValue);
            }}
            placeholder={placeholder}
            disabled={disabled}
            fullWidth={fullWidth}
            error={error}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onFocus={onFocus}
            autoFocus={autoFocus}
            required={required}
            readOnly={readOnly}
            tabIndex={tabIndex}
            dataTestId={dataTestId}
          />
        </StyledContainer>
      );
    }

    const handleMaskedChange = (newValue: string) => {
      handleChange(newValue);
    };

    const handleMaskedKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      handleKeyDown(event);
      onKeyDown?.(event);
    };

    return (
      <StyledContainer fullWidth={fullWidth}>
        <StyledTextInputWrapper hasError={!!error}>
          <TextInput
            ref={inputRef}
            label={label}
            value={displayValue}
            onChange={handleMaskedChange}
            onKeyDown={handleMaskedKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            fullWidth={fullWidth}
            error={undefined}
            onBlur={onBlur}
            onFocus={onFocus}
            autoFocus={autoFocus}
            required={required}
            readOnly={readOnly}
            tabIndex={tabIndex}
            dataTestId={dataTestId}
          />
        </StyledTextInputWrapper>
        {error && <StyledError>{error}</StyledError>}
      </StyledContainer>
    );
  },
);

MaskedTextInput.displayName = 'MaskedTextInput';
