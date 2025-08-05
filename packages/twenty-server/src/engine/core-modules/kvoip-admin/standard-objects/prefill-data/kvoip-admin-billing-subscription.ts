import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { KVOIP_ADMIN_WORKSPACE } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-workspace';

export const KVOIP_ADMIN_BILLING_SUBSCRIPTION = {
  workspaceId: KVOIP_ADMIN_WORKSPACE.id,
  stripeCustomerId: 'cus_admin0',
  stripeSubscriptionId: 'sub_admin0',
  status: SubscriptionStatus.Active,
  metadata: {
    workspaceId: KVOIP_ADMIN_WORKSPACE.id,
  },
};
