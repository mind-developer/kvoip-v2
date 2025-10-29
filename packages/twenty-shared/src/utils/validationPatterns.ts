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

export type DynamicMaskFunction = (value: string) => string;

export interface TextValidationPattern {
  pattern?: string;
  mask?: string;
  dynamicMask?: string;
  placeholder?: string;
  errorMessage?: string;
  validateOnType?: boolean;
}

const createDigitBasedMask = (
  masks: Array<{ maxDigits: number; mask: string }>,
) => {
  return (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    const digitCount = digitsOnly.length;

    const matchedMask = masks.find((m) => digitCount <= m.maxDigits);
    return matchedMask?.mask || masks[masks.length - 1].mask;
  };
};

const CPF_CNPJ_MASK = createDigitBasedMask([
  { maxDigits: 11, mask: '000.000.000-00' },
  { maxDigits: 14, mask: '00.000.000/0000-00' },
]);

const CST_CSOSN_MASK = createDigitBasedMask([
  { maxDigits: 3, mask: '000' },
  { maxDigits: 4, mask: '0000' },
]);

export const DYNAMIC_MASK_REGISTRY: Record<string, DynamicMaskFunction> = {
  CPF_CNPJ_MASK: CPF_CNPJ_MASK,
  CST_CSOSN_MASK: CST_CSOSN_MASK,
} as const;

export const resolveDynamicMask = (
  maskIdentifier: string | undefined,
): DynamicMaskFunction | undefined => {
  if (!maskIdentifier) {
    return undefined;
  }

  return DYNAMIC_MASK_REGISTRY[maskIdentifier];
};

export const TEXT_VALIDATION_PATTERNS = {
  BR_STATE_REGISTRATION: {
    pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}\\.\\d{3}$',
    mask: '000.000.000.000',
    placeholder: '000.000.000.000',
  } as TextValidationPattern,

  BR_MUNICIPAL_REGISTRATION: {
    pattern: '^\\d{8}-\\d$',
    mask: '00000000-0',
    placeholder: '00000000-0',
  } as TextValidationPattern,

  BR_CPF: {
    pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
    mask: '000.000.000-00',
    placeholder: '000.000.000-00',
  } as TextValidationPattern,

  BR_CNPJ: {
    pattern: '^\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}$',
    mask: '00.000.000/0000-00',
    placeholder: '00.000.000/0000-00',
  } as TextValidationPattern,

  BR_CEP: {
    pattern: '^\\d{5}-\\d{3}$',
    mask: '00000-000',
    placeholder: '00000-000',
  } as TextValidationPattern,

  BR_PHONE: {
    pattern: '^$\\d{2}$\\s\\d{5}-\\d{4}$',
    mask: '(00) 00000-0000',
    placeholder: '(00) 00000-0000',
  } as TextValidationPattern,

  BR_STATE: {
    pattern: '^[A-Z]{2}$',
    mask: 'AA',
    placeholder: 'SP',
  } as TextValidationPattern,

  BR_CNAE: {
    pattern: '^\\d{4}-\\d{1}/\\d{2}$',
    mask: '0000-0/00',
    placeholder: '0000-0/00',
  } as TextValidationPattern,

  CUSTOM_CODE_EXAMPLE: {
    pattern: '^\\d{3}\\.\\d{2}\\.[A-Za-z0-9]{3}$',
    mask: '000.00.###',
    placeholder: '000.00.ABC',
  } as TextValidationPattern,

  BR_CFOP: {
    pattern: '^\\d{4}$',
    mask: '0000',
    placeholder: '0000',
  } as TextValidationPattern,

  BR_CST_CSOSN: {
    pattern: '^\\d{3,4}$',
    dynamicMask: 'CST_CSOSN_MASK',
    placeholder: '000 or 0000',
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
  } as TextValidationPattern,

  PRODUCT_NAME: {
    placeholder: 'Enter product name',
  } as TextValidationPattern,

  UNIT_OF_MEASURE: {
    pattern: '^[a-zA-Z]{1,10}$',
    mask: 'AAAAAAAAAA',
    placeholder: 'kg, unit, liter',
  } as TextValidationPattern,

  NCM: {
    pattern: '^\\d{4}\\.\\d{2}\\.\\d{2}$',
    mask: '0000.00.00',
    placeholder: '0000.00.00',
  } as TextValidationPattern,

  CFOP: {
    pattern: '^\\d{4}$',
    mask: '0000',
    placeholder: '0000',
  } as TextValidationPattern,

  CEST: {
    pattern: '^\\d{2}\\.\\d{3}\\.\\d{2}$',
    mask: '00.000.00',
    placeholder: '00.000.00',
  } as TextValidationPattern,

  COMMERCIAL_UNIT: {
    pattern: '^[A-Z]{2,10}$',
    mask: 'AAAAAAAAAA',
    placeholder: 'UN, KG, LT',
  } as TextValidationPattern,

  CST_PIS_COFINS: {
    pattern: '^\\d{2}$',
    mask: '00',
    placeholder: '00',
  } as TextValidationPattern,

  SERVICE_LIST_ITEM: {
    pattern: '^\\d{1,2}\\.\\d{2}$',
    mask: '00.00',
    placeholder: '01.02',
  } as TextValidationPattern,

  MUNICIPAL_TAX_CODE: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter municipal tax code',
  } as TextValidationPattern,

  CLASSIFICATION: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,100}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter classification',
  } as TextValidationPattern,

  LOCALE: {
    pattern: '^[a-z]{2}(-[A-Z]{2})?$',
    mask: 'en-US',
    placeholder: 'en-US',
  } as TextValidationPattern,

  USER_EMAIL: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    placeholder: 'user@example.com',
  } as TextValidationPattern,

  TIMEZONE: {
    pattern: '^[a-zA-Z_/]+$',
    mask: 'America/Sao_Paulo',
    placeholder: 'America/Sao_Paulo',
  } as TextValidationPattern,

  USER_DOCUMENT: {
    pattern:
      '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
    dynamicMask: 'CPF_CNPJ_MASK',
    placeholder: '000.000.000-00 or 00.000.000/0000-00',
  } as TextValidationPattern,

  AGENT_ID: {
    placeholder: 'agent-123',
  } as TextValidationPattern,

  EXTENSION_NUMBER: {
    pattern: '^\\d{3,6}$',
    mask: '000000',
    placeholder: '123456',
  } as TextValidationPattern,

  COMPANY_NAME: {
    placeholder: 'Enter company name',
  } as TextValidationPattern,

  CPF_CNPJ: {
    pattern:
      '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
    dynamicMask: 'CPF_CNPJ_MASK',
    placeholder: '000.000.000-00 or 00.000.000/0000-00',
  } as TextValidationPattern,

  MUNICIPAL_REGISTRATION: {
    pattern: '^\\d{8}-\\d$',
    mask: '00000000-0',
    placeholder: '00000000-0',
  } as TextValidationPattern,

  STATE_REGISTRATION: {
    pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}\\.\\d{3}$',
    mask: '000.000.000.000',
    placeholder: '000.000.000.000',
  } as TextValidationPattern,

  CDR_ID: {
    pattern: '^[a-zA-Z0-9\\-_]{3,50}$',
    placeholder: 'cdr-123-abc',
  } as TextValidationPattern,

  CHARGE_NAME: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{2,100}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter charge name',
  } as TextValidationPattern,

  TOTAL_AMOUNT: {
    pattern: '^\\d{1,10}(\\.\\d{1,2})?$',
    placeholder: '1000.00',
  } as TextValidationPattern,

  CSTICMSCSOSN: {
    pattern: '^\\d{3,4}$',
    dynamicMask: 'CST_CSOSN_MASK',
    placeholder: '000 or 0000',
  } as TextValidationPattern,

  SUBSCRIBER_CODE: {
    pattern: '^[a-zA-Z0-9\\-]{3,20}$',
    placeholder: '1234567890',
  } as TextValidationPattern,

  NUM_SUBSCRIBER_AGREEMENT: {
    pattern: '^[a-zA-Z0-9\\-]{3,20}$',
    placeholder: '1234567890',
  } as TextValidationPattern,

  ISSUE_DATE: {
    pattern: '^\\d{2}/\\d{2}/\\d{4}$',
    mask: '00/00/0000',
    placeholder: 'DD/MM/YYYY',
  } as TextValidationPattern,

  RPS_NUMBER: {
    pattern: '^[a-zA-Z0-9\\-]{1,20}$',
    placeholder: 'RPS-123',
  } as TextValidationPattern,

  REQUEST_CODE: {
    pattern: '^[a-zA-Z0-9\\-_]{3,20}$',
    mask: 'AAAAAAAAAAAAAAAAAAAA',
    placeholder: 'REQ-123',
  } as TextValidationPattern,

  TAX_ID: {
    pattern:
      '^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$',
    dynamicMask: 'CPF_CNPJ_MASK',
    placeholder: '000.000.000-00 or 00.000.000/0000-00',
  } as TextValidationPattern,

  TELEPHONY_MEMBER_ID: {
    pattern: '^[a-zA-Z0-9\\-_]{3,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'member-123',
  } as TextValidationPattern,

  TELEPHONY_EXTENSION_NUMBER: {
    pattern: '^\\d{3,6}$',
    mask: '000000',
    placeholder: '123456',
  } as TextValidationPattern,

  TELEPHONY_EXTENSION_NAME: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter extension name',
  } as TextValidationPattern,

  TELEPHONY_EXTENSION_GROUP: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter extension group',
  } as TextValidationPattern,

  TELEPHONY_TYPE: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,30}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter type',
  } as TextValidationPattern,

  TELEPHONY_DIALING_PLAN: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter dialing plan',
  } as TextValidationPattern,

  TELEPHONY_AREA_CODE: {
    pattern: '^\\d{2,4}$',
    mask: '0000',
    placeholder: '11',
  } as TextValidationPattern,

  TELEPHONY_SIP_PASSWORD: {
    pattern: '^[a-zA-Z0-9\\-_]{6,20}$',
    mask: 'AAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter SIP password',
  } as TextValidationPattern,

  TELEPHONY_CALLER_EXTERNAL_ID: {
    pattern: '^[a-zA-Z0-9\\-_]{3,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'caller-123',
  } as TextValidationPattern,

  TELEPHONY_PULL_CALLS: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter pull calls configuration',
  } as TextValidationPattern,

  TELEPHONY_EMAIL_FOR_MAILBOX: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    mask: 'user@example.com',
    placeholder: 'user@example.com',
  } as TextValidationPattern,

  TELEPHONY_FORWARD_NUMBER: {
    pattern: '^\\d{3,15}$',
    mask: '000000000000000',
    placeholder: '1234567890',
  } as TextValidationPattern,

  TELEPHONY_RAMAL_ID: {
    pattern: '^[a-zA-Z0-9\\-_]{3,20}$',
    mask: 'AAAAAAAAAAAAAAAAAAAA',
    placeholder: 'ramal-123',
  } as TextValidationPattern,

  TELEPHONY_ADVANCED_FORWARDING: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter forwarding configuration',
  } as TextValidationPattern,

  TELEPHONY_ADVANCED_FORWARDING_VALUE: {
    pattern: '^[a-zA-Z0-9\\s\\-\\.,]{1,50}$',
    mask: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    placeholder: 'Enter forwarding value',
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
