import { PaymentProviderCapabilities } from 'src/engine/core-modules/payment/interfaces/payment-provider-capabilities.interface';

/**
 * Helper to check if a specific payment method is supported
 */
export const supportsPaymentMethod = (
  capabilities: PaymentProviderCapabilities,
  method: string,
): boolean => {
  const methodMap: Record<string, keyof PaymentProviderCapabilities> = {
    BOLETO: 'boleto',
    BOLEPIX: 'bolepix',
    PIX: 'pix',
    CREDIT_CARD: 'creditCard',
    DEBIT_CARD: 'debitCard',
    BANK_TRANSFER: 'bankTransfer',
  };

  const capabilityKey = methodMap[method];

  return capabilityKey ? capabilities[capabilityKey] : false;
};
