import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

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
