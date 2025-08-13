import { BillingProductLimit } from 'src/engine/core-modules/billing/entities/billing-product-limit.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingProductLimitType } from 'src/engine/core-modules/billing/enums/billing-product-limit-type-enum';

type BillingProductLimitMap = Record<
  BillingPlanKey,
  Pick<BillingProductLimit, 'productKey' | 'type' | 'limit'>[]
>;

export const BILLING_DEFAULT_PLAN_TO_PRODUCT_LIMIT_MAP: BillingProductLimitMap =
  {
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
