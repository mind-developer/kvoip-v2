import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ClientChat } from 'twenty-shared/types';

export enum ClientChatEvent {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

registerEnumType(ClientChatEvent, {
  name: 'ClientChatEvent',
});

@ObjectType()
export class ClientChatEventDTO {
  @Field(() => ClientChatEvent)
  event: ClientChatEvent;

  @Field()
  clientChatEventDate: Date;

  @Field(() => GraphQLJSON)
  clientChat: ClientChat;
}
