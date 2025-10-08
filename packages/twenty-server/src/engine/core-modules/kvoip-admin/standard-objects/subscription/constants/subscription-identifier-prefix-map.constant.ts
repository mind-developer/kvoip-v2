import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';

export const IDENTIFIDER_PREFIX_MAP = {
  [BillingPaymentProviders.Stripe]: 'stripe-sub_',
  [BillingPaymentProviders.Inter]: 'inter-sub_',
};
