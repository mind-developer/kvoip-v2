import { Field, ID, InputType } from '@nestjs/graphql';

import { IsArray, IsObject, IsString } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@InputType()
export class ChatbotFlowInput {
  @Field(() => graphqlTypeJson)
  @IsArray()
  @IsObject({ each: true })
  nodes: any[];

  @Field(() => graphqlTypeJson)
  @IsArray()
  @IsObject({ each: true })
  edges: any[];

  @Field()
  @IsString()
  chatbotId: string;
}
