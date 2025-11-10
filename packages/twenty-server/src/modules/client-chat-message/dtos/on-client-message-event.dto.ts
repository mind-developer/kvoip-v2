import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ClientChatMessage } from 'twenty-shared/types';

export enum ClientMessageEvent {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

registerEnumType(ClientMessageEvent, {
  name: 'ClientMessageEvent',
});

@ObjectType()
export class ClientMessageEventDTO {
  @Field(() => ClientMessageEvent)
  event: ClientMessageEvent;

  @Field()
  clientChatMessageEventDate: Date;

  @Field(() => GraphQLJSON)
  clientChatMessage: ClientChatMessage;
}
