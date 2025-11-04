import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OnChatEventInput {
  @Field(() => String)
  sectorId: string;
}
