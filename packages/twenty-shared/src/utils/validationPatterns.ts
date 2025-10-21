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

    // Person entity validations
    JOB_TITLE: {
      pattern: '^[a-zA-Z\\s\\-\\.,]{2,100}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'Enter job title',
      errorMessage: 'Invalid job title. Must be 2-100 characters, letters, spaces, hyphens, periods, and commas only',
    } as TextValidationPattern,

    CITY: {
      pattern: '^[a-zA-Z\\s\\-\\.,]{2,50}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'Enter city name',
      errorMessage: 'Invalid city name. Must be 2-50 characters, letters, spaces, hyphens, periods, and commas only',
    } as TextValidationPattern,

    AVATAR_URL: {
      pattern: '^https?://[^\\s]+$',
      mask: 'https://example.com/image.jpg',
      placeholder: 'https://example.com/image.jpg',
      errorMessage: 'Invalid URL format. Must start with http:// or https://',
    } as TextValidationPattern,

    // Product entity validations
    PRODUCT_NAME: {
      pattern: '^[a-zA-Z0-9\\s\\-\\.,]{2,100}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'Enter product name',
      errorMessage: 'Invalid product name. Must be 2-100 characters, alphanumeric, spaces, hyphens, periods, and commas only',
    } as TextValidationPattern,

    UNIT_OF_MEASURE: {
      pattern: '^[a-zA-Z]{1,10}$',
      mask: 'AAAAAAAAAA',
      placeholder: 'kg, unit, liter',
      errorMessage: 'Invalid unit of measure. Must be 1-10 letters only',
    } as TextValidationPattern,

    NCM: {
      pattern: '^\\d{4}\\.\\d{2}\\.\\d{2}$',
      mask: '0000.00.00',
      placeholder: '0000.00.00',
      errorMessage: 'Invalid NCM. Expected format: 0000.00.00 (8 digits with dots)',
    } as TextValidationPattern,

    CFOP: {
      pattern: '^\\d{4}$',
      mask: '0000',
      placeholder: '0000',
      errorMessage: 'Invalid CFOP. Expected format: 0000 (4 digits)',
    } as TextValidationPattern,

    CEST: {
      pattern: '^\\d{2}\\.\\d{3}\\.\\d{2}$',
      mask: '00.000.00',
      placeholder: '00.000.00',
      errorMessage: 'Invalid CEST. Expected format: 00.000.00',
    } as TextValidationPattern,

    COMMERCIAL_UNIT: {
      pattern: '^[A-Z]{2,10}$',
      mask: 'AAAAAAAAAA',
      placeholder: 'UN, KG, LT',
      errorMessage: 'Invalid commercial unit. Must be 2-10 uppercase letters',
    } as TextValidationPattern,

    CST_PIS_COFINS: {
      pattern: '^\\d{2}$',
      mask: '00',
      placeholder: '00',
      errorMessage: 'Invalid CST. Expected format: 00 (2 digits)',
    } as TextValidationPattern,

    SERVICE_LIST_ITEM: {
      pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'Enter service list code',
      errorMessage: 'Invalid service list item. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
    } as TextValidationPattern,

    MUNICIPAL_TAX_CODE: {
      pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'Enter municipal tax code',
      errorMessage: 'Invalid municipal tax code. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
    } as TextValidationPattern,

    CLASSIFICATION: {
      pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,100}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'Enter classification',
      errorMessage: 'Invalid classification. Must be 1-100 characters, alphanumeric, spaces, hyphens, periods, and commas only',
    } as TextValidationPattern,

    // Workspace-member entity validations
    COLOR_SCHEME: {
      pattern: '^(System|Light|Dark)$',
      mask: 'System',
      placeholder: 'System',
      errorMessage: 'Invalid color scheme. Must be System, Light, or Dark',
    } as TextValidationPattern,

    LOCALE: {
      pattern: '^[a-z]{2}(-[A-Z]{2})?$',
      mask: 'en-US',
      placeholder: 'en-US',
      errorMessage: 'Invalid locale format. Expected format: en-US or pt-BR',
    } as TextValidationPattern,

    USER_EMAIL: {
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      mask: 'user@example.com',
      placeholder: 'user@example.com',
      errorMessage: 'Invalid email format. Expected format: user@example.com',
    } as TextValidationPattern,

    TIMEZONE: {
      pattern: '^[a-zA-Z_/]+$',
      mask: 'America/Sao_Paulo',
      placeholder: 'America/Sao_Paulo',
      errorMessage: 'Invalid timezone format. Expected format: America/Sao_Paulo',
    } as TextValidationPattern,

    USER_DOCUMENT: {
      pattern: '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
      mask: '000.000.000-00',
      placeholder: '000.000.000-00 or 00.000.000/0000-00',
      errorMessage: 'Invalid document format. Expected CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)',
    } as TextValidationPattern,

    AGENT_ID: {
      pattern: '^[a-zA-Z0-9\\-_]{3,20}$',
      mask: 'AAAAAAAAAAAAAAAAAAAA',
      placeholder: 'agent-123',
      errorMessage: 'Invalid agent ID. Must be 3-20 characters, alphanumeric, hyphens, and underscores only',
    } as TextValidationPattern,

    EXTENSION_NUMBER: {
      pattern: '^\\d{3,6}$',
      mask: '000000',
      placeholder: '123456',
      errorMessage: 'Invalid extension number. Must be 3-6 digits',
    } as TextValidationPattern,

    // Company entity validations
    COMPANY_NAME: {
      pattern: '^[a-zA-Z0-9\\s\\-\\.,&]{2,100}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'Enter company name',
      errorMessage: 'Invalid company name. Must be 2-100 characters, alphanumeric, spaces, hyphens, periods, commas, and ampersands only',
    } as TextValidationPattern,

    CPF_CNPJ: {
      pattern: '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
      mask: '000.000.000-00',
      placeholder: '000.000.000-00 or 00.000.000/0000-00',
      errorMessage: 'Invalid CPF/CNPJ format. Expected CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)',
    } as TextValidationPattern,

    MUNICIPAL_REGISTRATION: {
      pattern: '^\\d{8}-\\d$',
      mask: '00000000-0',
      placeholder: '00000000-0',
      errorMessage: 'Invalid municipal registration. Expected format: 00000000-0',
    } as TextValidationPattern,

    STATE_REGISTRATION: {
      pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}\\.\\d{3}$',
      mask: '000.000.000.000',
      placeholder: '000.000.000.000',
      errorMessage: 'Invalid state registration. Expected format: 000.000.000.000',
    } as TextValidationPattern,

    CDR_ID: {
      pattern: '^[a-zA-Z0-9\\-_]{3,50}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'cdr-123-abc',
      errorMessage: 'Invalid CDR ID. Must be 3-50 characters, alphanumeric, hyphens, and underscores only',
    } as TextValidationPattern,

    // Charge entity validations
    CHARGE_NAME: {
      pattern: '^[a-zA-Z0-9\\s\\-\\.,]{2,100}$',
      mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      placeholder: 'Enter charge name',
      errorMessage: 'Invalid charge name. Must be 2-100 characters, alphanumeric, spaces, hyphens, periods, and commas only',
    } as TextValidationPattern,

    REQUEST_CODE: {
      pattern: '^[a-zA-Z0-9\\-_]{3,20}$',
      mask: 'AAAAAAAAAAAAAAAAAAAA',
      placeholder: 'REQ-123',
      errorMessage: 'Invalid request code. Must be 3-20 characters, alphanumeric, hyphens, and underscores only',
    } as TextValidationPattern,

    TAX_ID: {
      pattern: '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
      mask: '000.000.000-00',
      placeholder: '000.000.000-00 or 00.000.000/0000-00',
      errorMessage: 'Invalid tax ID format. Expected CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)',
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
