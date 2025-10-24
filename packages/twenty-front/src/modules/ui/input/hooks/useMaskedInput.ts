/* @kvoip-woulz proprietary */
import { useEffect, useRef, useState } from 'react';
import { applyMask } from 'twenty-shared/utils';

export type UseMaskedInputProps = {
  value: string | undefined;
  mask?: string;
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
  uppercase = false,
  onChange,
}: UseMaskedInputProps): UseMaskedInputReturn => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [lastCursorPos, setLastCursorPos] = useState<number>(0);

  useEffect(() => {
    if (inputRef.current && cursorPosition !== null && mask) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [value, cursorPosition, mask]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement || !mask) return;

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
  }, [mask]);

  const handleChange = (newValue: string) => {
    if (!mask) {
      onChange(uppercase ? newValue.toUpperCase() : newValue);
      return;
    }

    const previousValue = value || '';
    const previousLength = previousValue.length;

    const processedValue = uppercase ? newValue.toUpperCase() : newValue;
    const maskedValue = applyMask(processedValue, mask);
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputRef.current) {
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
