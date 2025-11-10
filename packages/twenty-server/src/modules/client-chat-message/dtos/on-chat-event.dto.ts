import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';

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
  clientChat: ClientChatWorkspaceEntity;
}
