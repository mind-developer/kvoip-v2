import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingProductLimitType } from 'src/engine/core-modules/billing/enums/billint-product-limit-type-enum';
import { BillingProductLimits } from 'src/engine/core-modules/billing/types/billing-product-limits.type';

export const BILLING_DEFAULT_PLAN_TO_PRODUCT_LIMIT_MAP: Record<
  BillingPlanKey,
  BillingProductLimits[]
> = {
  [BillingPlanKey.PRO]: [
    {
      productKey: BillingProductKey.WORSPACE_MEMBERS,
      type: BillingProductLimitType.MAX_UNITS,
      limit: 10,
    },
    {
      productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
      type: BillingProductLimitType.EXECUTIONS,
      limit: 1000,
    },
  ],
  [BillingPlanKey.ENTERPRISE]: [
    {
      productKey: BillingProductKey.WORSPACE_MEMBERS,
      type: BillingProductLimitType.MAX_UNITS,
      limit: 50,
    },
    {
      productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
      type: BillingProductLimitType.EXECUTIONS,
      limit: 2000,
    },
  ],
};
