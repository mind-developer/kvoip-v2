import { ownterAllView } from 'src/engine/core-modules/kvoip-admin/standard-objects/views/owner-all-views';
import { subscriptionAllView } from 'src/engine/core-modules/kvoip-admin/standard-objects/views/subscription-all-views';
import { tenantAllView } from 'src/engine/core-modules/kvoip-admin/standard-objects/views/tenant-all-views';

export const KVOIP_ADMIN_ALL_VIEWS = [
  tenantAllView,
  ownterAllView,
  subscriptionAllView,
];
