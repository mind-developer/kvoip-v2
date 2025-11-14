/* @kvoip-woulz proprietary */
import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

/**
 * Calcula o tamanho máximo de dígitos do número nacional baseado no código do país.
 * Considera que o número completo (calling code + número nacional) não pode exceder 15 dígitos (padrão E.164).
 *
 * @param countryCode - Código do país (ex: 'BR', 'US')
 * @returns O tamanho máximo de dígitos permitidos para o número nacional
 */
export const getMaxNationalDigits = (
  countryCode: CountryCode | string | null,
): number => {
  if (!countryCode) {
    // Se não houver código do país, retorna um valor padrão conservador
    return 10;
  }

  try {
    const callingCode = getCountryCallingCode(countryCode as CountryCode);
    const callingCodeLength = callingCode.toString().length;

    // Padrão E.164: máximo de 15 dígitos no total (incluindo calling code)
    // O número nacional máximo é 15 - tamanho do calling code
    const maxNationalDigits = 15 - callingCodeLength;

    // Garante um mínimo de 4 dígitos (caso de calling codes muito longos)
    return Math.max(4, maxNationalDigits);
  } catch {
    // Em caso de erro, retorna um valor padrão conservador
    return 10;
  }
};
