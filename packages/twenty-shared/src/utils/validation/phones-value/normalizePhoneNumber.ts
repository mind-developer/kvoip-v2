/* @kvoip-woulz proprietary */
import { type CountryCode, parsePhoneNumberWithError } from 'libphonenumber-js';

export type NormalizedPhoneNumber = {
  primaryPhoneNumber: string;
  primaryPhoneCallingCode: string;
  primaryPhoneCountryCode: CountryCode | '';
};
export const normalizePhoneNumber = (
  phoneNumber: string,
): NormalizedPhoneNumber => {
  const normalizedInput = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+${phoneNumber}`;

  const parsed = parsePhoneNumberWithError(normalizedInput);

  return {
    primaryPhoneNumber: parsed.nationalNumber,
    primaryPhoneCallingCode: `+${parsed.countryCallingCode}`,
    primaryPhoneCountryCode: '',
  };
};
