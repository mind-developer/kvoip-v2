import { Field, ObjectType } from '@nestjs/graphql';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

@ObjectType()
export class BillingProductLimits {
  @Field(() => BillingProductKey)
  productKey: BillingProductKey;

  @Field(() => BillingProductKey)
  type: BillingProductKey;

  @Field(() => Number)
  limit: number;
}
