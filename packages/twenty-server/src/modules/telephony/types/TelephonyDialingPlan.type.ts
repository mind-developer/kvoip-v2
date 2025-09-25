import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TelephonyDialingPlan {
  @Field(() => ID, { nullable: true })
  plano_discagem_id?: string;

  @Field({ nullable: true })
  nome?: string;

  @Field({ nullable: true })
  cliente_id?: string;
}
