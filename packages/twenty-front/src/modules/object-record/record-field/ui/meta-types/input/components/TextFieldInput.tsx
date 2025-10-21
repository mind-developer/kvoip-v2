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
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  }, [draftValue, hasMask]);

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
    } catch (error: any) {
      return false;
    }
  };
  /* @kvoip-woulz proprietary:end */

  const handleEnter = (newText: string) => {
    /* @kvoip-woulz proprietary:begin */
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);

    if (isValid) {
      onEnter?.({
        newValue: trimmedValue,
        skipPersist: false,
      });
    }
    /* @kvoip-woulz proprietary:end */
  };

  const handleEscape = (newText: string) => {
    onEscape?.({ newValue: newText.trim() });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    /* @kvoip-woulz proprietary:begin */
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);

    onClickOutside?.({
      newValue: trimmedValue,
      event,
      skipPersist: !isValid,
    });
    /* @kvoip-woulz proprietary:end */
  };

  const handleTab = (newText: string) => {
    /* @kvoip-woulz proprietary:begin */
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);

    if (isValid) {
      onTab?.({
        newValue: trimmedValue,
        skipPersist: false,
      });
    }
    /* @kvoip-woulz proprietary:end */
  };

  const handleShiftTab = (newText: string) => {
    /* @kvoip-woulz proprietary:begin */
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);

    if (isValid) {
      onShiftTab?.({
        newValue: trimmedValue,
        skipPersist: false,
      });
    }
    /* @kvoip-woulz proprietary:end */
  };

  const handleChange = (
    /* @kvoip-woulz proprietary:begin */
    newValueOrEvent: string | React.ChangeEvent<HTMLInputElement>,
    /* @kvoip-woulz proprietary:end */
  ) => {
    /* @kvoip-woulz proprietary:begin */
    let newValue: string;
    let currentCursorPos = 0;

    if (typeof newValueOrEvent === 'string') {
      newValue = newValueOrEvent;
    } else {
      newValue = newValueOrEvent.target.value;
      currentCursorPos = newValueOrEvent.target.selectionStart || 0;
    }

    if (hasMask && validationSettings?.mask) {
      const previousLength = (draftValue || '').length;
      newValue = applyMask(newValue, validationSettings.mask);
      const newLength = newValue.length;

      if (newLength > previousLength) {
        setCursorPosition(currentCursorPos + (newLength - previousLength));
      } else {
        setCursorPosition(currentCursorPos);
      }
    }

    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newValue));

    if (validationSchema) {
      const isValid = validateValue(newValue);
      setIsFieldInError(!isValid && newValue.trim() !== '');
    } else {
      setIsFieldInError(false);
    }
    /* @kvoip-woulz proprietary:end */
  };

  /* @kvoip-woulz proprietary:begin */
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
      handleClickOutside(new MouseEvent('click') as any, e.target.value);
    }
  };

  const placeholder =
    validationSettings?.placeholder || fieldDefinition.metadata.placeHolder;

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
