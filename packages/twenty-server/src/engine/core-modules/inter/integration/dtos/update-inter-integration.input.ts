import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class UpdateInterIntegrationInput {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  integrationName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  clientId: string;

  /* @kvoip-woulz proprietary:begin */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Matches(/^\d{8}-\d{2}$/, {
    message: 'Current account must be in the format: 00000000-00',
  })
  currentAccount: string;
  /* @kvoip-woulz proprietary:end */

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  clientSecret: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  privateKey?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  certificate?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expirationDate?: Date;
}
