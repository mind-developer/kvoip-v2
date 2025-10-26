/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';
import { useMaskedInput } from '../hooks/useMaskedInput';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  ${TEXT_INPUT_STYLE}
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.color.red : theme.border.color.medium};
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.color.red : theme.color.blue};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
    cursor: not-allowed;
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
};

export const MaskedTextInput = ({
  label,
  value,
  onChange,
  mask,
  placeholder,
  disabled,
  fullWidth,
  error,
  uppercase = false,
}: MaskedTextInputProps) => {
  const { inputRef, handleChange, handleKeyDown, displayValue } =
    useMaskedInput({
      value,
      mask,
      uppercase,
      onChange,
    });

  return (
    <StyledContainer style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && <StyledLabel>{label}</StyledLabel>}
      <StyledInput
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        hasError={!!error}
      />
      {error && <StyledError>{error}</StyledError>}
    </StyledContainer>
  );
};
