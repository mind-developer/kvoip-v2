import { Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ClientChatMessage } from 'twenty-shared/types';

export enum ClientMessageEvent {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export class ClientMessageEventDTO {
  @Field(() => ClientMessageEvent)
  event: ClientMessageEvent;

  @Field()
  clientChatMessageEventDate: Date;

  @Field(() => GraphQLJSON)
  clientChatMessage: ClientChatMessage;
}
