import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
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
>;

export const transformDatabaseBillingSubscriptionToSubscriptionWorkspaceEntity =
  ({
    billing,
    price,
    ownerId,
    subscriptionPlanId,
    tenantId,
  }: {
    billing: BillingSubscription;
    price: BillingPrice;
    ownerId: string;
    subscriptionPlanId: string;
    tenantId: string;
  }): SubscriptionWorkspaceEntityUpsertData => ({
    identifier:
      billing.stripeSubscriptionId ||
      `inter-sub_${billing.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`,
    paymentProvider: billing.provider,
    recurrence: billing.interval as SubscriptionInterval,
    status: billing.status,
    amount: {
      amountMicros: price.unitAmount as number,
      currencyCode: price.currency,
    },
    trialStart: billing.trialStart,
    trialEnd: billing.trialEnd,
    ownerId,
    subscriptionPlanId,
    tenantId,
  });
