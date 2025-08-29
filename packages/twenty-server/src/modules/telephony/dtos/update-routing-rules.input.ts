import { Field, InputType, Int } from '@nestjs/graphql';

import { IsNumber } from 'class-validator';

import { UpdateRoutingRulesDataInput } from 'src/modules/telephony/dtos/update-routing-rules-data.input';

@InputType()
export class UpdateRoutingRulesInput {
  @Field(() => Int)
  @IsNumber()
  plano_discagem_id: number;

  @Field(() => Int)
  @IsNumber()
  cliente_id: number;

  @Field(() => UpdateRoutingRulesDataInput)
  dados: UpdateRoutingRulesDataInput;
}
