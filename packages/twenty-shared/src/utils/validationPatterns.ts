/* @kvoip-woulz proprietary */
/**
 * Mask Pattern Guide:
 * - '0' = Required digit (0-9)
 * - '9' = Optional digit (0-9)
 * - '#' = Any character (letter or digit)
 * - 'A' = Required letter (a-z, A-Z)
 * - 'a' = Optional letter (a-z, A-Z)
 * - Any other character = Fixed character (literal)
 */
export type TextValidationPatternKey = keyof typeof TEXT_VALIDATION_PATTERNS;

const maskCache = new Map<string, Map<string, string>>();
const MAX_CACHE_SIZE = 100;

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
    pattern: '^$\\d{2}$\\s\\d{5}-\\d{4}$',
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

  JOB_TITLE: {
    placeholder: 'Enter job title',
  } as TextValidationPattern,

  CITY: {
    placeholder: 'Enter city name',
  } as TextValidationPattern,

  AVATAR_URL: {
    pattern: '^https?://[^\\s]+$',
    placeholder: 'https://example.com/image.jpg',
    errorMessage: 'Invalid URL format. Must start with http:// or https://',
  } as TextValidationPattern,

  PRODUCT_NAME: {
    placeholder: 'Enter product name',
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
    errorMessage:
      'Invalid NCM. Expected format: 0000.00.00 (8 digits with dots)',
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
    errorMessage:
      'Invalid service list item. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  MUNICIPAL_TAX_CODE: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter municipal tax code',
    errorMessage:
      'Invalid municipal tax code. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  CLASSIFICATION: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,100}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter classification',
    errorMessage:
      'Invalid classification. Must be 1-100 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  LOCALE: {
    pattern: '^[a-z]{2}(-[A-Z]{2})?$',
    mask: 'en-US',
    placeholder: 'en-US',
    errorMessage: 'Invalid locale format. Expected format: en-US or pt-BR',
  } as TextValidationPattern,

  USER_EMAIL: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
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
    pattern:
      '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
    mask: '000.000.000-00',
    placeholder: '000.000.000-00 or 00.000.000/0000-00',
    errorMessage:
      'Invalid document format. Expected CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)',
  } as TextValidationPattern,

  AGENT_ID: {
    placeholder: 'agent-123',
  } as TextValidationPattern,

  EXTENSION_NUMBER: {
    pattern: '^\\d{3,6}$',
    mask: '000000',
    placeholder: '123456',
    errorMessage: 'Invalid extension number. Must be 3-6 digits',
  } as TextValidationPattern,

  COMPANY_NAME: {
    placeholder: 'Enter company name',
  } as TextValidationPattern,

  CPF_CNPJ: {
    pattern:
      '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
    mask: '000.000.000-00',
    placeholder: '000.000.000-00 or 00.000.000/0000-00',
    errorMessage:
      'Invalid CPF/CNPJ format. Expected CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)',
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
    errorMessage:
      'Invalid state registration. Expected format: 000.000.000.000',
  } as TextValidationPattern,

  CDR_ID: {
    pattern: '^[a-zA-Z0-9\\-_]{3,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'cdr-123-abc',
    errorMessage:
      'Invalid CDR ID. Must be 3-50 characters, alphanumeric, hyphens, and underscores only',
  } as TextValidationPattern,

  CHARGE_NAME: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{2,100}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter charge name',
    errorMessage:
      'Invalid charge name. Must be 2-100 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  REQUEST_CODE: {
    pattern: '^[a-zA-Z0-9\\-_]{3,20}$',
    mask: 'AAAAAAAAAAAAAAAAAAAA',
    placeholder: 'REQ-123',
    errorMessage:
      'Invalid request code. Must be 3-20 characters, alphanumeric, hyphens, and underscores only',
  } as TextValidationPattern,

  TAX_ID: {
    pattern:
      '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
    mask: '000.000.000-00',
    placeholder: '000.000.000-00 or 00.000.000/0000-00',
    errorMessage:
      'Invalid tax ID format. Expected CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)',
  } as TextValidationPattern,

  // Telephony validation patterns
  TELEPHONY_MEMBER_ID: {
    pattern: '^[a-zA-Z0-9\\-_]{3,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'member-123',
    errorMessage:
      'Invalid member ID. Must be 3-50 characters, alphanumeric, hyphens, and underscores only',
  } as TextValidationPattern,

  TELEPHONY_EXTENSION_NUMBER: {
    pattern: '^\\d{3,6}$',
    mask: '000000',
    placeholder: '123456',
    errorMessage: 'Invalid extension number. Must be 3-6 digits',
  } as TextValidationPattern,

  TELEPHONY_EXTENSION_NAME: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter extension name',
    errorMessage:
      'Invalid extension name. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  TELEPHONY_EXTENSION_GROUP: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter extension group',
    errorMessage:
      'Invalid extension group. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  TELEPHONY_TYPE: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,30}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter type',
    errorMessage:
      'Invalid type. Must be 1-30 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  TELEPHONY_DIALING_PLAN: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter dialing plan',
    errorMessage:
      'Invalid dialing plan. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  TELEPHONY_AREA_CODE: {
    pattern: '^\\d{2,4}$',
    mask: '0000',
    placeholder: '11',
    errorMessage: 'Invalid area code. Must be 2-4 digits',
  } as TextValidationPattern,

  TELEPHONY_SIP_PASSWORD: {
    pattern: '^[a-zA-Z0-9\\-_]{6,20}$',
    mask: 'AAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter SIP password',
    errorMessage:
      'Invalid SIP password. Must be 6-20 characters, alphanumeric, hyphens, and underscores only',
  } as TextValidationPattern,

  TELEPHONY_CALLER_EXTERNAL_ID: {
    pattern: '^[a-zA-Z0-9\\-_]{3,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'caller-123',
    errorMessage:
      'Invalid caller external ID. Must be 3-50 characters, alphanumeric, hyphens, and underscores only',
  } as TextValidationPattern,

  TELEPHONY_PULL_CALLS: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter pull calls configuration',
    errorMessage:
      'Invalid pull calls configuration. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  TELEPHONY_EMAIL_FOR_MAILBOX: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    mask: 'user@example.com',
    placeholder: 'user@example.com',
    errorMessage: 'Invalid email format. Expected format: user@example.com',
  } as TextValidationPattern,

  TELEPHONY_FORWARD_NUMBER: {
    pattern: '^\\d{3,15}$',
    mask: '000000000000000',
    placeholder: '1234567890',
    errorMessage: 'Invalid forward number. Must be 3-15 digits',
  } as TextValidationPattern,

  TELEPHONY_RAMAL_ID: {
    pattern: '^[a-zA-Z0-9\\-_]{3,20}$',
    mask: 'AAAAAAAAAAAAAAAAAAAA',
    placeholder: 'ramal-123',
    errorMessage:
      'Invalid ramal ID. Must be 3-20 characters, alphanumeric, hyphens, and underscores only',
  } as TextValidationPattern,

  TELEPHONY_ADVANCED_FORWARDING: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter forwarding configuration',
    errorMessage:
      'Invalid forwarding configuration. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,

  TELEPHONY_ADVANCED_FORWARDING_VALUE: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter forwarding value',
    errorMessage:
      'Invalid forwarding value. Must be 1-50 characters, alphanumeric, spaces, hyphens, periods, and commas only',
  } as TextValidationPattern,
} as const;

export const applyMask = (value: string, mask: string): string => {
  if (!value || !mask) return value;

  if (!maskCache.has(mask)) {
    maskCache.set(mask, new Map());
  }

  const maskSpecificCache = maskCache.get(mask)!;

  if (maskSpecificCache.has(value)) {
    return maskSpecificCache.get(value)!;
  }

  let maskedValue = '';
  let valueIndex = 0;

  for (
    let maskIndex = 0;
    maskIndex < mask.length && valueIndex < value.length;
    maskIndex++
  ) {
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

  if (maskSpecificCache.size >= MAX_CACHE_SIZE) {
    const firstKey = maskSpecificCache.keys().next().value!;
    maskSpecificCache.delete(firstKey);
  }

  maskSpecificCache.set(value, maskedValue);

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
  const requiredLength = mask
    .split('')
    .filter((char) => ['0', 'A', '#'].includes(char)).length;

  return unmasked.length >= requiredLength;
};

export const clearMaskCache = (): void => {
  maskCache.clear();
};
