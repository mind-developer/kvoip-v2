import styled from '@emotion/styled';
import { useContext, useMemo, useState } from 'react';
import { IMaskInput } from 'react-imask';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createTextValidationSchema } from '@/object-record/record-field/ui/validation-schemas/textWithPatternSchema';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';
import { useTextField } from '../../hooks/useTextField';

const StyledMaskedInput = styled(IMaskInput)`
  margin: 0;
  ${TEXT_INPUT_STYLE}
  width: 100%;
  
  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
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

  const validationSettings = fieldDefinition?.metadata?.settings?.validation;
  const hasMask = !!validationSettings?.mask;

  const validationSchema = useMemo(() => {
    if (!validationSettings?.pattern) {
      return null;
    }

    return createTextValidationSchema(
      validationSettings.pattern,
      validationSettings.errorMessage,
    );
  }, [validationSettings]);

  const validateValue = (value: string): boolean => {
    if (!validationSchema) {
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

  const handleEnter = (newText: string) => {
    const trimmedValue = newText.trim();
    const isValid = validateValue(trimmedValue);
    
    onEnter?.({ 
      newValue: trimmedValue,
      skipPersist: !isValid, 
    });
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

  const handleChange = (newText: string) => {
    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newText));
    if (validationError) {
      setValidationError('');
    }
  };

  const placeholder = validationSettings?.placeholder || fieldDefinition.metadata.placeHolder;

  if (hasMask && validationSettings?.mask) {
    return (
      <FieldInputContainer>
        <StyledMaskedInput
          mask={validationSettings.mask}
          placeholder={placeholder}
          value={draftValue ?? ''}
          onAccept={(value: string) => handleChange(value)}
          autoFocus
          unmask={false} 
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            const target = e.target as HTMLInputElement;
            const value = target.value;

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
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!relatedTarget) {
              handleClickOutside(
                new MouseEvent('click') as any,
                e.target.value,
              );
            }
          }}
        />
        {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
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
      {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
    </FieldInputContainer>
  );
};