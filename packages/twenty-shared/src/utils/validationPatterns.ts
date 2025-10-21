/**
 * Mask Pattern Guide:
 * - '0' = Required digit (0-9)
 * - '9' = Optional digit (0-9) 
 * - '#' = Any character (letter or digit)
 * - 'A' = Required letter (a-z, A-Z)
 * - 'a' = Optional letter (a-z, A-Z)
 * - Any other character = Fixed character (literal)
 */

export interface TextValidationPattern {
    pattern?: string;          
    mask?: string;             
    placeholder?: string;      
    errorMessage?: string;     
    validateOnType?: boolean;  
  }
  
  export const TEXT_VALIDATION_PATTERNS = {
    BR_STATE_REGISTRATION: {
      pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}\\.\\d{3}$',
      mask: '000.000.000.000',
      placeholder: '000.000.000.000',
      errorMessage: 'Invalid State Registration. Format: 000.000.000.000',
    } as TextValidationPattern,
  
    BR_MUNICIPAL_REGISTRATION: {
      pattern: '^\\d{8}-\\d$',
      mask: '00000000-0',
      placeholder: '00000000-0',
      errorMessage: 'Invalid Municipal Registration. Format: 00000000-0',
    } as TextValidationPattern,
  
    BR_CPF: {
      pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
      mask: '000.000.000-00',
      placeholder: '000.000.000-00',
      errorMessage: 'Invalid CPF. Format: 000.000.000-00',
    } as TextValidationPattern,
  
    BR_CNPJ: {
      pattern: '^\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}$',
      mask: '00.000.000/0000-00',
      placeholder: '00.000.000/0000-00',
      errorMessage: 'Invalid CNPJ. Format: 00.000.000/0000-00',
    } as TextValidationPattern,
  
    BR_CEP: {
      pattern: '^\\d{5}-\\d{3}$',
      mask: '00000-000',
      placeholder: '00000-000',
      errorMessage: 'Invalid CEP. Format: 00000-000',
    } as TextValidationPattern,
  
    BR_PHONE: {
      pattern: '^\$\\d{2}\$\\s\\d{5}-\\d{4}$',
      mask: '(00) 00000-0000',
      placeholder: '(00) 00000-0000',
      errorMessage: 'Invalid Phone. Format: (00) 00000-0000',
    } as TextValidationPattern,

    CUSTOM_CODE_EXAMPLE: {
      pattern: '^\\d{3}\\.\\d{2}\\.[A-Za-z0-9]{3}$',
      mask: '000.00.###',
      placeholder: '000.00.ABC',
      errorMessage: 'Invalid code. Format: 000.00.ABC',
    } as TextValidationPattern,

    BR_CFOP: {
      pattern: '^\\d{4}$',
      mask: '0000',
      placeholder: '0000',
      errorMessage: 'Invalid CFOP. Expected format: 0000 (4 digits)',
    } as TextValidationPattern,

    BR_CST_CSOSN: {
      pattern: '^\\d{3}$',
      mask: '000',
      placeholder: '000',
      errorMessage: 'Invalid CST/CSOSN. Expected format: 000 (3 digits)',
    } as TextValidationPattern,
  } as const;
  
  export type TextValidationPatternKey = keyof typeof TEXT_VALIDATION_PATTERNS;
  
  export const applyMask = (value: string, mask: string): string => {
    if (!value || !mask) return value;
  
    let maskedValue = '';
    let valueIndex = 0;
  
    for (let maskIndex = 0; maskIndex < mask.length && valueIndex < value.length; maskIndex++) {
      const maskChar = mask[maskIndex];
      const valueChar = value[valueIndex];

      if (isMaskPlaceholder(maskChar)) {
        if (isValidCharForMask(valueChar, maskChar)) {
          maskedValue += valueChar;
          valueIndex++;
        } else {
          valueIndex++;
          maskIndex--; 
        }
      } else {
        maskedValue += maskChar;

        if (valueChar === maskChar) {
          valueIndex++;
        }
      }
    }
  
    return maskedValue;
  };
  
  const isMaskPlaceholder = (char: string): boolean => {
    return ['0', '9', '#', 'A', 'a'].includes(char);
  };
  
  const isValidCharForMask = (char: string, maskChar: string): boolean => {
    switch (maskChar) {
      case '0': // Required digit
        return /\d/.test(char);
      case '9': // Optional digit
        return /\d/.test(char);
      case '#': // Any character
        return /[a-zA-Z0-9]/.test(char);
      case 'A': // Required letter
        return /[a-zA-Z]/.test(char);
      case 'a': // Optional letter
        return /[a-zA-Z]/.test(char);
      default:
        return false;
    }
  };
  
  export const getUnmaskedValue = (value: string, mask: string): string => {
    if (!value || !mask) return value;
  
    let unmasked = '';
    let maskIndex = 0;
  
    for (let i = 0; i < value.length && maskIndex < mask.length; i++) {
      const char = value[i];
      const maskChar = mask[maskIndex];
  
      if (isMaskPlaceholder(maskChar)) {
        unmasked += char;
        maskIndex++;
      } else if (char === maskChar) {
        maskIndex++;
      }
    }
  
    return unmasked;
  };
  
  export const getMaskLength = (mask: string): number => {
    return mask.length;
  };
  
  export const isValueComplete = (value: string, mask: string): boolean => {
    if (!mask) return true;
    
    const unmasked = getUnmaskedValue(value, mask);
    const requiredLength = mask.split('').filter(char => 
      ['0', 'A', '#'].includes(char)
    ).length;
  
    return unmasked.length >= requiredLength;
  };
