import { Field, ID, InputType, Int } from '@nestjs/graphql';

import { IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateDialingPlanInput {
  @Field(() => Int)
  @IsNumber()
  plano_discagem_id: number;

  @Field()
  @IsString()
  nome: string;

  @Field(() => Int)
  @IsNumber()
  cliente_id: number;

  @Field(() => ID)
  @IsString()
  workspaceId: string;
}
