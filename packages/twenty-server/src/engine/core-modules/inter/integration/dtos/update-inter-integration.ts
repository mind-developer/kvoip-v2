import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateInterIntegrationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  crtFileUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  keyFileUrl?: string;
}
