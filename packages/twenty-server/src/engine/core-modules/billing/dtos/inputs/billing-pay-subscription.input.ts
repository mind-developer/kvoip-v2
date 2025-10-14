import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class BillingPaySubscriptionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  interChargeCode: string;
}
