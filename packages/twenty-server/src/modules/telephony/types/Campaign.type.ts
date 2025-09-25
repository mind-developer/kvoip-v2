import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Campaign {
  @Field(() => ID, { nullable: true })
  campanha_id?: string;

  @Field({ nullable: true })
  cliente_id?: string;

  @Field({ nullable: true })
  nome?: string;
}
