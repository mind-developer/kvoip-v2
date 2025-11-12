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
  const parsed = parsePhoneNumberWithError(phoneNumber);

  return {
    primaryPhoneNumber: parsed.nationalNumber,
    primaryPhoneCallingCode: `+${parsed.countryCallingCode}`,
    primaryPhoneCountryCode: '',
  };
};
