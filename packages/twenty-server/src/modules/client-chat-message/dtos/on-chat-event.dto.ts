import { Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ClientChat } from 'twenty-shared/types';

enum ClientChatEvent {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export class CllientChatEventDTO {
  @Field(() => ClientChatEvent)
  event: ClientChatEvent;

  @Field()
  ClientChatEventDate: Date;

  @Field(() => GraphQLJSON)
  clientChat: ClientChat;
}
