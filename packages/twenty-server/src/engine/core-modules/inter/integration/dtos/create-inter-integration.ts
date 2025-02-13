import { Field, ID, InputType } from '@nestjs/graphql';

import { IsDate, IsString } from 'class-validator';

@InputType()
export class CreateInterIntegrationInput {
  @Field()
  @IsString()
  clientId: string;

  @Field()
  @IsString()
  clientSecret: string;

  @Field({ nullable: true })
  @IsString()
  crtFileUrl: string;

  @Field({ nullable: true })
  @IsString()
  keyFileUrl: string;

  @Field(() => ID)
  @IsString()
  workspaceId: string;

  @Field()
  @IsDate()
  createdAt: Date;

  @Field()
  @IsDate()
  updatedAt: Date;

  @Field()
  @IsDate()
  deletedAt: Date;
}
