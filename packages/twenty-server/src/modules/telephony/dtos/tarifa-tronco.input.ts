import { Field, InputType, Int } from '@nestjs/graphql';

import { IsNumber, IsString } from 'class-validator';

@InputType()
export class TarifaTroncoInput {
  @Field(() => Int)
  @IsNumber()
  regiao_id: number;

  @Field(() => Int)
  @IsNumber()
  tarifa: number;

  @Field()
  @IsString()
  fracionamento: string;
}
