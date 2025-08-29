import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateMessageInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  clientPhoneNumber: string;

  @Field()
  @IsString()
  @IsOptional()
  message?: string;

  @Field()
  @IsBoolean()
  @IsOptional()
  sent?: boolean;

  @Field()
  @IsBoolean()
  @IsOptional()
  received?: boolean;

  @Field()
  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @Field()
  @IsBoolean()
  @IsOptional()
  edited?: boolean;
}
