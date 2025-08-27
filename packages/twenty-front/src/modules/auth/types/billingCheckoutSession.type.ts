import { type SubscriptionInterval } from '~/generated-metadata/graphql';
import {
  type BillingPaymentProviders,
  type BillingPlanKey,
} from '~/generated/graphql';

export type BillingCheckoutSession = {
  plan: BillingPlanKey;
  interval: SubscriptionInterval;
  requirePaymentMethod: boolean;
  paymentProvider?: BillingPaymentProviders;
};
