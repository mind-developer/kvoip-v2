import { Field, InputType } from '@nestjs/graphql';

import { IsArray } from 'class-validator';

import { RegionInput } from 'src/modules/telephony/dtos/region.input';

@InputType()
export class UpdateRoutingRulesDataInput {
  @Field(() => [RegionInput])
  @IsArray()
  regioes: RegionInput[];
}
