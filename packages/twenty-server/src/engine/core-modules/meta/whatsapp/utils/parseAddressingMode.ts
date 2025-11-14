/* @kvoip-woulz proprietary */

type AddressingModeResult = {
  phoneNumber: string;
  lid: string;
  primaryType: 'lid' | 'pn';
};

export const parseAddressingMode = (
  addressingString: string,
): AddressingModeResult => {
  const params = new URLSearchParams(addressingString);
  const primary = params.get('primary') || '';
  const secondary = params.get('secondary') || '';
  const addressingMode = params.get('addressingMode') || 'pn';

  if (addressingMode === 'lid') {
    return {
      lid: primary,
      phoneNumber: secondary,
      primaryType: 'lid',
    };
  }

  // Default to 'pn' mode
  return {
    phoneNumber: primary,
    lid: secondary,
    primaryType: 'pn',
  };
};
