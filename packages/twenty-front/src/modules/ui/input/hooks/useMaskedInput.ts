/* @kvoip-woulz proprietary */
import { useEffect, useRef, useState } from 'react';
import { applyMask } from 'twenty-shared/utils';

export type UseMaskedInputProps = {
  value: string | undefined;
  mask?: string;
  dynamicMask?: (value: string) => string;
  uppercase?: boolean;
  onChange: (value: string) => void;
};

export type UseMaskedInputReturn = {
  inputRef: React.RefObject<HTMLInputElement>;
  handleChange: (newValue: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  displayValue: string;
};

export const useMaskedInput = ({
  value,
  mask,
  dynamicMask,
  uppercase = false,
  onChange,
}: UseMaskedInputProps): UseMaskedInputReturn => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [lastCursorPos, setLastCursorPos] = useState<number>(0);

  const hasMask = !!(mask || dynamicMask);

  useEffect(() => {
    if (inputRef.current && cursorPosition !== null && hasMask === true) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [value, cursorPosition, hasMask]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement || hasMask === false) return;

    const updateCursorPosition = () => {
      setLastCursorPos(inputElement.selectionStart || 0);
    };

    inputElement.addEventListener('click', updateCursorPosition);
    inputElement.addEventListener('keyup', updateCursorPosition);
    inputElement.addEventListener('paste', updateCursorPosition);

    return () => {
      inputElement.removeEventListener('click', updateCursorPosition);
      inputElement.removeEventListener('keyup', updateCursorPosition);
      inputElement.removeEventListener('paste', updateCursorPosition);
    };
  }, [hasMask]);

  const handleChange = (newValue: string) => {
    if (!hasMask) {
      onChange(uppercase ? newValue.toUpperCase() : newValue);
      return;
    }

    const previousValue = value || '';
    const previousLength = previousValue.length;

    const processedValue = uppercase ? newValue.toUpperCase() : newValue;

    const activeMask = dynamicMask ? dynamicMask(processedValue) : mask!;

    const maskedValue = applyMask(processedValue, activeMask);
    const newLength = maskedValue.length;

    const lengthDiff = newLength - previousLength;
    let newCursorPos = lastCursorPos;

    if (lengthDiff > 0) {
      newCursorPos = lastCursorPos + lengthDiff;
    } else if (lengthDiff < 0) {
      newCursorPos = Math.max(0, lastCursorPos + lengthDiff);
    }

    newCursorPos = Math.min(newCursorPos, maskedValue.length);
    setCursorPosition(newCursorPos);

    onChange(maskedValue);
  };

  const handleKeyDown = (_event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputRef.current !== null) {
      setLastCursorPos(inputRef.current.selectionStart || 0);
    }
  };

  return {
    inputRef,
    handleChange,
    handleKeyDown,
    displayValue: value || '',
  };
};
