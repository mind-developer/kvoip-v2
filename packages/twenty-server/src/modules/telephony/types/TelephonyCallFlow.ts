import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TelephonyCallFlow {
  @Field(() => ID, { nullable: true })
  fluxo_chamada_id?: string;

  @Field({ nullable: true })
  fluxo_chamada_nome?: string;
}
