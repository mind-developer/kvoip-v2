/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingProductLimits } from 'src/engine/core-modules/billing/types/billing-product-limits.type';

@ObjectType()
export class BillingProductMetadata {
  @Field(() => BillingPlanKey)
  planKey: BillingPlanKey;

  @Field(() => BillingUsageType)
  priceUsageBased: BillingUsageType;

  @Field(() => BillingProductKey)
  productKey: BillingProductKey;

  @Field(() => BillingProductLimits, { nullable: true })
  limits?: BillingProductLimits;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: string | Record<string, any> | undefined;
}
