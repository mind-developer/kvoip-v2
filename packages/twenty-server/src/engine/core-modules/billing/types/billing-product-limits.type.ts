import { Field, ObjectType } from '@nestjs/graphql';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingProductLimitType } from 'src/engine/core-modules/billing/enums/billint-product-limit-type-enum';

@ObjectType()
export class BillingProductLimits {
  @Field(() => BillingProductKey)
  productKey: BillingProductKey;

  @Field(() => BillingProductLimitType)
  type: BillingProductLimitType;

  @Field(() => Number)
  limit: number;
}
