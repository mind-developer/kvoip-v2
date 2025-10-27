import { Field, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessageEvent,
  Reaction,
} from 'twenty-shared/types';

@InputType()
export class SendClientChatMessageInput {
  @Field(() => String)
  from: string;
  @Field(() => String)
  fromType: ChatMessageFromType;
  @Field(() => String)
  to: string;
  @Field(() => String)
  toType: ChatMessageToType;
  @Field(() => String)
  provider: ChatIntegrationProvider;
  @Field(() => String)
  type: ChatMessageType;
  @Field(() => String, { nullable: true })
  textBody: string | null;
  @Field(() => String, { nullable: true })
  caption: string | null;
  @Field(() => String)
  deliveryStatus: ChatMessageDeliveryStatus;
  @Field(() => String, { nullable: true })
  edited: boolean | null;
  @Field(() => String, { nullable: true })
  attachmentUrl: string | null;
  @Field(() => String, { nullable: true })
  event: ClientChatMessageEvent | null;
  @Field(() => String)
  clientChatId: string;
  @Field(() => String)
  providerIntegrationId: string;
  @Field(() => String)
  workspaceId: string;
  @Field(() => GraphQLJSON, { nullable: true })
  reactions: Reaction[] | null;
  @Field(() => String, { nullable: true })
  repliesTo: string | null;
  @Field(() => String, { nullable: true })
  templateId: string | null;
  @Field(() => String, { nullable: true })
  templateLanguage: string | null;
}
