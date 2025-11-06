/* @kvoip-woulz proprietary */
import { PaymentProvider } from '../enums/payment-provider.enum';

/**
 * Injection tokens for payment providers
 */
export const PAYMENT_PROVIDER_TOKENS = {
  [PaymentProvider.INTER]: 'INTER_PAYMENT_PROVIDER',
  [PaymentProvider.ASAS]: 'ASAS_PAYMENT_PROVIDER',
  [PaymentProvider.STRIPE]: 'STRIPE_PAYMENT_PROVIDER',
  // TODO: Add other payment providers as they are implemented
  // [PaymentProvider.BRADESCO]: 'BRADESCO_PAYMENT_PROVIDER',
} as const;
