import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateMessageDataInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  integrationId: string;

  @Field()
  @IsString()
  clientPhoneNumber: string;

  @Field()
  @IsString()
  @IsOptional()
  message?: string;

  @Field()
  @IsString()
  @IsOptional()
  status?: 'sent' | 'delivered' | 'read';

  @Field()
  @IsString()
  @IsOptional()
  deleted?: boolean;

  @Field()
  @IsBoolean()
  @IsOptional()
  edited?: boolean;
}
