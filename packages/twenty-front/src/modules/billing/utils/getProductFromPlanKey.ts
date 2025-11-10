import { type BillingBaseProductPricesQueryPlan } from '@/billing/types/planQueryPlan';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

export const getProductFromPlanByKey = (
  planKey: BillingPlanKey,
  plans?: BillingBaseProductPricesQueryPlan[],
) => plans?.find((plan) => plan.planKey === planKey)?.baseProduct;
