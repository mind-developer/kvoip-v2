import styled from '@emotion/styled';
import { useContext } from 'react';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { createTextValidationSchema } from '@/object-record/record-field/ui/validation-schemas/textWithPatternSchema';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';
import { useMaskedInput } from '@/ui/input/hooks/useMaskedInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { StyledInput } from '@/views/components/ViewBarFilterDropdownFieldSelectMenu';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';
import { useTextField } from '../../hooks/useTextField';
import { useRegisterInputEvents } from '../hooks/useRegisterInputEvents';

const ErrorText = styled.span`
  color: ${({ theme }) => theme.color.red};
  font-size: 12px;
  margin-top: 4px;
  display: block;
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

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledInputWithError = styled(StyledInput)<{ hasError?: boolean }>`
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.color.red : theme.border.color.medium};
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.color.red : theme.color.blue};
  }
`;

export const TextFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useTextField();
  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const [isFieldInError, setIsFieldInError] = useRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const validationSettings = fieldDefinition?.metadata?.settings?.validation;
  const validationPattern = validationSettings?.pattern;
  const validationMask = validationSettings?.mask;
  const validationErrorMessage = validationSettings?.errorMessage;
  const validationPlaceholder = validationSettings?.placeholder;

  const hasMask = !!validationMask;
  const hasPattern = !!validationPattern;

  const validationSchema =
    hasPattern && validationPattern
      ? createTextValidationSchema(validationPattern, validationErrorMessage)
      : null;

  const placeholder =
    validationPlaceholder || fieldDefinition.metadata.placeHolder;

  const validateValue = (value: string): boolean => {
    if (!validationSchema) {
      return true;
    }

    if (!value || value.trim() === '') {
      return true;
    }

    try {
      validationSchema.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleEnter = (newText: string) => {
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);

    onEnter?.({
      newValue: trimmedValue,
      skipPersist: !isValid,
    });
  };

  const handleEscape = (newText: string) => {
    onEscape?.({ newValue: newText.trim() });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);

    onClickOutside?.({
      newValue: trimmedValue,
      event,
      skipPersist: !isValid,
    });
  };

  const handleTab = (newText: string) => {
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);

    onTab?.({
      newValue: trimmedValue,
      skipPersist: !isValid,
    });
  };

  const handleShiftTab = (newText: string) => {
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);

    onShiftTab?.({
      newValue: trimmedValue,
      skipPersist: !isValid,
    });
  };

  const {
    inputRef,
    handleChange: handleMaskedChange,
    handleKeyDown: handleMaskedKeyDown,
  } = useMaskedInput({
    value: draftValue,
    mask: validationMask,
    onChange: (newValue: string) => {
      setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newValue));

      if (validationSchema) {
        const isValid = validateValue(newValue);
        setIsFieldInError(!isValid && newValue.trim() !== '');
      } else {
        setIsFieldInError(false);
      }
    },
  });

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef,
    inputValue: draftValue ?? '',
    onEnter: handleEnter,
    onEscape: handleEscape,
    onClickOutside: handleClickOutside,
    onTab: handleTab,
    onShiftTab: handleShiftTab,
  });

  const handleChange = (
    newValueOrEvent: string | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue =
      typeof newValueOrEvent === 'string'
        ? newValueOrEvent
        : newValueOrEvent.target.value;

    if (hasMask && validationMask) {
      handleMaskedChange(newValue);
      return;
    }

    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newValue));

    if (validationSchema) {
      const isValid = validateValue(newValue);
      setIsFieldInError(!isValid && newValue.trim() !== '');
    } else {
      setIsFieldInError(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hasMask && validationMask) {
      handleMaskedKeyDown(e);
    }
  };

  if (hasMask && validationMask) {
    return (
      <FieldInputContainer>
        <InputWrapper>
          <StyledInputWithError
            id={instanceId}
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={draftValue ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            hasError={isFieldInError}
          />
          {isFieldInError && validationErrorMessage && (
            <ErrorText>{validationErrorMessage}</ErrorText>
          )}
        </InputWrapper>
      </FieldInputContainer>
    );
  }

  return (
    <FieldInputContainer>
      <TextAreaInput
        instanceId={instanceId}
        placeholder={placeholder}
        autoFocus
        value={draftValue ?? ''}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        onChange={handleChange}
      />
    </FieldInputContainer>
  );
};
