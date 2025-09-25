import { Field, InputType, Int } from '@nestjs/graphql';

import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class RoutingRuleInput {
  @Field(() => Int)
  @IsNumber()
  prioridade: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  tronco_id?: number;

  @Field()
  @IsString()
  tronco_nome: string;
}
