import { Field, InputType, Int } from '@nestjs/graphql';

import { IsArray, IsNumber, IsString } from 'class-validator';

import { RoutingRuleInput } from 'src/modules/telephony/dtos/routing-rule.input';

@InputType()
export class RegionInput {
  @Field(() => Int)
  @IsNumber()
  regiao_id: number;

  @Field()
  @IsString()
  regiao_nome: string;

  @Field(() => [RoutingRuleInput])
  @IsArray()
  roteamentos: RoutingRuleInput[];
}
