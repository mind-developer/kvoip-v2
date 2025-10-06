import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsInt, IsString } from 'class-validator';

@InputType()
export class CreateFinancialClosingInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsBoolean()
  lastDayMonth: boolean;

  @Field()
  @IsString()
  time: string;

  @Field(() => Int)
  @IsInt()
  day: number;

  @Field(() => [ID])
  @IsArray()
  @IsString({ each: true })
  billingModelIds: string[];

  @Field(() => ID)
  @IsString()
  workspaceId: string;
}