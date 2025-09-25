import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateFinancialClosingInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  lastDayMonth?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  time?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  day?: number;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  billingModelIds?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  workspaceId?: string;
}
