import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetWhatsappTemplatesInput {
  @Field(() => String)
  integrationId: string;
}
