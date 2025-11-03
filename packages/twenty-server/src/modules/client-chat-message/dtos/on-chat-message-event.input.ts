import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OnChatMessageEventInput {
  @Field(() => String)
  chatId: string;
}
