import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { createTextValidationSchema } from '@/object-record/record-field/ui/validation-schemas/textWithPatternSchema';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';
import { applyMask } from '../../../../../../../../../twenty-shared/src/utils/validationPatterns';
import { useTextField } from '../../hooks/useTextField';

const StyledInput = styled.input<{ hasError?: boolean }>`
  margin: 0;
  ${TEXT_INPUT_STYLE}
  width: 100%;
  
  ${({ hasError, theme }) =>
    hasError &&
    `
    border: 1px solid ${theme.border.color.danger};
    text-decoration: none;
    box-shadow: none;
    background-image: none;
  `}

  &:focus {
    outline: none;
    text-decoration: none;
  }

  &:hover {
    text-decoration: none;
  }
`;

const StyledTextAreaInput = styled(TextAreaInput)<{ hasError?: boolean }>`
  ${({ hasError, theme }) =>
    hasError &&
    `
    textarea {
      border: 1px solid ${theme.border.color.danger} !important;
      
      &:focus {
        border: 1px solid ${theme.border.color.danger} !important;
      }
    }
  `}
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

export const TextFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useTextField();
  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const [validationError, setValidationError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const [isFieldInError, setIsFieldInError] = useRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const validationSettings = fieldDefinition?.metadata?.settings?.validation;
  const hasMask = !!validationSettings?.mask;
  const hasPattern = !!validationSettings?.pattern;

  const validationSchema = useMemo(() => {
    if (!hasPattern) {
      return null;
    }

    return createTextValidationSchema(
      validationSettings?.pattern,
      validationSettings?.errorMessage,
    );
  }, [hasPattern, validationSettings]);

  useEffect(() => {
    if (inputRef.current && hasMask) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [draftValue, cursorPosition, hasMask]);

  const validateValue = (value: string): boolean => {
    if (!validationSchema) {
      setValidationError('');
      return true;
    }

    if (!value || value.trim() === '') {
      setValidationError('');
      return true;
    }

    try {
      validationSchema.parse(value);
      setValidationError('');
      return true;
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Invalid format';
      setValidationError(errorMessage);
      return false;
    }
  };

  // Event handlers with validation
  const handleEnter = (newText: string) => {
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);
    
    // Only call onEnter if validation passes, otherwise keep the field open
    if (isValid) {
      onEnter?.({ 
        newValue: trimmedValue,
        skipPersist: false,
      });
    }
  };

  const handleEscape = (newText: string) => {
    setValidationError('');
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
    
    // Only call onTab if validation passes, otherwise keep the field open
    if (isValid) {
      onTab?.({ 
        newValue: trimmedValue,
        skipPersist: false,
      });
    }
  };

  const handleShiftTab = (newText: string) => {
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);
    
    // Only call onShiftTab if validation passes, otherwise keep the field open
    if (isValid) {
      onShiftTab?.({ 
        newValue: trimmedValue,
        skipPersist: false,
      });
    }
  };

  const handleChange = (newValueOrEvent: string | React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string;
    let currentCursorPos = 0;

    // Handle both string (from TextAreaInput) and event (from masked input)
    if (typeof newValueOrEvent === 'string') {
      newValue = newValueOrEvent;
    } else {
      newValue = newValueOrEvent.target.value;
      currentCursorPos = newValueOrEvent.target.selectionStart || 0;
    }
    
    // Apply mask if configured
    if (hasMask && validationSettings?.mask) {
      const previousLength = (draftValue || '').length;
      newValue = applyMask(newValue, validationSettings.mask);
      const newLength = newValue.length;
      
      // Adjust cursor position after mask application
      if (newLength > previousLength) {
        setCursorPosition(currentCursorPos + (newLength - previousLength));
      } else {
        setCursorPosition(currentCursorPos);
      }
    }
    
    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newValue));
    
    // Real-time validation like email field
    if (validationSchema) {
      const isValid = validateValue(newValue);
      setIsFieldInError(!isValid && newValue.trim() !== '');
    } else if (validationError) {
      // Clear error when typing
      setValidationError('');
      setIsFieldInError(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnter(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEscape(value);
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      handleTab(value);
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      handleShiftTab(value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget) {
      handleClickOutside(
        new MouseEvent('click') as any,
        e.target.value,
      );
    }
  };

  // Get placeholder from validation settings or use default
  const placeholder = validationSettings?.placeholder || fieldDefinition.metadata.placeHolder;

  // If field has mask, use custom masked input
  if (hasMask && validationSettings?.mask) {
    return (
      <FieldInputContainer>
        <StyledInput
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={draftValue ?? ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus
          hasError={isFieldInError}
        />
      </FieldInputContainer>
    );
  }

  return (
    <FieldInputContainer>
      <StyledTextAreaInput
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
        hasError={isFieldInError}
      />
    </FieldInputContainer>
  );
};