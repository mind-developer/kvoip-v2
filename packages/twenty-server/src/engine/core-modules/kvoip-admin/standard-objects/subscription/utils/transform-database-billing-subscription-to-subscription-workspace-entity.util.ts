import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { getPriceFromStripeDecimal } from 'src/engine/core-modules/inter/utils/get-price-from-stripe-decimal.util';
import { IDENTIFIDER_PREFIX_MAP } from 'src/engine/core-modules/kvoip-admin/standard-objects/subscription/constants/subscription-identifier-prefix-map.constant';
import { SubscriptionWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/subscription.workspace-entity';

type SubscriptionWorkspaceEntityUpsertData = Pick<
  SubscriptionWorkspaceEntity,
  | 'identifier'
  | 'paymentProvider'
  | 'recurrence'
  | 'status'
  | 'amount'
  | 'trialStart'
  | 'trialEnd'
  | 'ownerId'
  | 'subscriptionPlanId'
  | 'tenantId'
  | 'billingSubscriptionId'
>;

export const getSubscriptionIdentifier = (
  id: string,
  provider: BillingPaymentProviders,
) =>
  `${IDENTIFIDER_PREFIX_MAP[provider]}${id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`;

export const transformDatabaseBillingSubscriptionToSubscriptionWorkspaceEntity =
  ({
    billingSubscription,
    price,
    subscriptionPlanId,
    tenantId,
    ownerId,
  }: {
    billingSubscription: BillingSubscription;
    price: BillingPrice;
    tenantId: string;
    ownerId?: string;
    subscriptionPlanId: string;
  }): SubscriptionWorkspaceEntityUpsertData => ({
    billingSubscriptionId: billingSubscription.id,
    identifier: getSubscriptionIdentifier(
      billingSubscription.stripeSubscriptionId || billingSubscription.id,
      billingSubscription.provider,
    ),
    paymentProvider: billingSubscription.provider,
    recurrence: billingSubscription.interval as SubscriptionInterval,
    status: billingSubscription.status,
    amount: {
      // TODO: This will have to change in the future to suport different payment providers as stripe saves the price in a different format.
      // TODO: We should either make all providers save the prices using stripe format or convert stripe to our db.
      amountMicros:
        getPriceFromStripeDecimal(price.unitAmountDecimal as string) *
        1_000_000,
      currencyCode: price.currency,
    },
    trialStart: billingSubscription.trialStart,
    trialEnd: billingSubscription.trialEnd,
    subscriptionPlanId,
    tenantId,
    ownerId: ownerId || null,
  });
