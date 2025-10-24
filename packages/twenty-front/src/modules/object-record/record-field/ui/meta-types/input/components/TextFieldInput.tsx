import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
/* @kvoip-woulz proprietary:begin */
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { createTextValidationSchema } from '@/object-record/record-field/ui/validation-schemas/textWithPatternSchema';
/* @kvoip-woulz proprietary:end */
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
/* @kvoip-woulz proprietary:begin */
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { StyledInput } from '@/views/components/ViewBarFilterDropdownFieldSelectMenu';
/* @kvoip-woulz proprietary:end */
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';
/* @kvoip-woulz proprietary:begin */
import { applyMask } from '../../../../../../../../../twenty-shared/src/utils/validationPatterns';
/* @kvoip-woulz proprietary:end */
import { useTextField } from '../../hooks/useTextField';

export const TextFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useTextField();
  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  /* @kvoip-woulz proprietary:begin */
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const [isFieldInError, setIsFieldInError] = useRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const validationPattern =
    fieldDefinition?.metadata?.settings?.validation?.pattern;
  const validationMask = fieldDefinition?.metadata?.settings?.validation?.mask;
  const validationErrorMessage =
    fieldDefinition?.metadata?.settings?.validation?.errorMessage;
  const validationPlaceholder =
    fieldDefinition?.metadata?.settings?.validation?.placeholder;

  const hasMask = !!validationMask;
  const hasPattern = !!validationPattern;

  const validationSchema = useMemo(() => {
    if (!hasPattern || !validationPattern) {
      return null;
    }

    return createTextValidationSchema(
      validationPattern,
      validationErrorMessage,
    );
  }, [hasPattern, validationPattern, validationErrorMessage]);

  const placeholder = useMemo(
    () => validationPlaceholder || fieldDefinition.metadata.placeHolder,
    [validationPlaceholder, fieldDefinition.metadata.placeHolder],
  );

  const validateValue = useCallback(
    (value: string): boolean => {
      if (!validationSchema) {
        return true;
      }

      if (!value || value.trim() === '') {
        return true;
      }

      try {
        validationSchema.parse(value);
        return true;
      } catch (error: any) {
        return false;
      }
    },
    [validationSchema],
  );

  useEffect(() => {
    if (inputRef.current && cursorPosition !== null && hasMask) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [draftValue, cursorPosition, hasMask]);
  /* @kvoip-woulz proprietary:end */

  /* @kvoip-woulz proprietary:begin */
  const handleEnter = useCallback(
    (newText: string) => {
      const trimmedValue = newText.trim();
      const isValid = validateValue(trimmedValue);

      onEnter?.({
        newValue: trimmedValue,
        skipPersist: !isValid,
      });
    },
    [onEnter, validateValue],
  );

  const handleEscape = useCallback(
    (newText: string) => {
      onEscape?.({ newValue: newText.trim() });
    },
    [onEscape],
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent, newText: string) => {
      const trimmedValue = newText.trim();
      const isValid = validateValue(trimmedValue);

      onClickOutside?.({
        newValue: trimmedValue,
        event,
        skipPersist: !isValid,
      });
    },
    [onClickOutside, validateValue],
  );

  const handleTab = useCallback(
    (newText: string) => {
      const trimmedValue = newText.trim();
      const isValid = validateValue(trimmedValue);

      onTab?.({
        newValue: trimmedValue,
        skipPersist: !isValid,
      });
    },
    [onTab, validateValue],
  );

  const handleShiftTab = useCallback(
    (newText: string) => {
      const trimmedValue = newText.trim();
      const isValid = validateValue(trimmedValue);

      onShiftTab?.({
        newValue: trimmedValue,
        skipPersist: !isValid,
      });
    },
    [onShiftTab, validateValue],
  );

  const handleChange = useCallback(
    (newValueOrEvent: string | React.ChangeEvent<HTMLInputElement>) => {
      let newValue: string;
      let currentCursorPos = 0;

      if (typeof newValueOrEvent === 'string') {
        newValue = newValueOrEvent;
      } else {
        newValue = newValueOrEvent.target.value;
        currentCursorPos = newValueOrEvent.target.selectionStart || 0;
      }

      if (hasMask && validationMask) {
        const previousValue = draftValue || '';
        const previousLength = previousValue.length;

        const maskedValue = applyMask(newValue, validationMask);
        const newLength = maskedValue.length;

        let newCursorPos = currentCursorPos;

        const lengthDiff = newLength - previousLength;
        const inputDiff = newValue.length - previousValue.length;

        if (lengthDiff > inputDiff) {
          newCursorPos = currentCursorPos + (lengthDiff - inputDiff);
        } else if (lengthDiff < 0) {
          newCursorPos = Math.max(0, currentCursorPos);
        } else {
          newCursorPos = currentCursorPos + lengthDiff;
        }

        newCursorPos = Math.min(newCursorPos, maskedValue.length);

        newValue = maskedValue;
        setCursorPosition(newCursorPos);
      }

      setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newValue));

      if (validationSchema) {
        const isValid = validateValue(newValue);
        setIsFieldInError(!isValid && newValue.trim() !== '');
      } else {
        setIsFieldInError(false);
      }
    },
    [
      hasMask,
      validationMask,
      draftValue,
      setDraftValue,
      validationSchema,
      validateValue,
      setIsFieldInError,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    },
    [handleEnter, handleEscape, handleTab, handleShiftTab],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!relatedTarget) {
        handleClickOutside(new MouseEvent('click') as any, e.target.value);
      }
    },
    [handleClickOutside],
  );

  if (hasMask && validationMask) {
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
        />
      </FieldInputContainer>
    );
  }
  /* @kvoip-woulz proprietary:end */

  return (
    <FieldInputContainer>
      <TextAreaInput
        instanceId={instanceId}
        /* @kvoip-woulz proprietary:begin */
        placeholder={placeholder}
        /* @kvoip-woulz proprietary:end */
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
