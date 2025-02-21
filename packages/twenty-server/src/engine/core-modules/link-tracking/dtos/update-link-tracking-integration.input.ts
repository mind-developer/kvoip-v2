import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class UpdateLinkTrackingIntegrationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  label?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  destinationUrl?: string;
}
