import { Field, ID, InputType } from '@nestjs/graphql';

import { IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateLinkTrackingIntegrationInput {
  @Field()
  @IsString()
  label: string;

  @Field()
  @IsUrl()
  destinationUrl: string;

  @Field(() => ID)
  @IsString()
  workspaceId: string;

  @Field()
  @IsString()
  campaign_source: string;
}
