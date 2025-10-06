import { Field, InputType, Int } from '@nestjs/graphql';

import { IsNumber, IsString } from 'class-validator';

@InputType()
export class PabxDialingPlanCreationDetailsInput {
  // plano_discagem_id is usually an output from PABX, but CreateDialingPlanInput requires it.
  // For the orchestrated call, we might expect the PABX to assign this or this needs clarification.
  // If it's user-provided for creation:
  @Field(() => Int)
  @IsNumber()
  plano_discagem_id: number; // If this is an external ID provided by the user for creation

  @Field()
  @IsString()
  nome: string;
}
