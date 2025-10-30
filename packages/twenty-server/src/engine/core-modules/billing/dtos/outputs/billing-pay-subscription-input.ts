import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingPaySubscriptionOutput {
  @Field(() => Boolean)
  success: boolean;
}
