import { Field, InputType } from '@nestjs/graphql';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessageEvent,
} from 'twenty-shared/types';

@InputType()
export class SendClientChatMessageInput {
  @Field(() => String)
  from: string;
  @Field(() => ChatMessageFromType)
  fromType: ChatMessageFromType;
  @Field(() => String)
  to: string;
  @Field(() => ChatMessageToType)
  toType: ChatMessageToType;
  @Field(() => String)
  provider: ChatIntegrationProvider;
  @Field(() => String)
  type: ChatMessageType;
  @Field(() => String)
  textBody: string;
  @Field(() => String)
  caption: string;
  @Field(() => String)
  deliveryStatus: ChatMessageDeliveryStatus;
  @Field(() => String)
  edited: boolean;
  @Field(() => String)
  attachmentUrl: string;
  @Field(() => ClientChatMessageEvent)
  event: ClientChatMessageEvent;
  @Field(() => String)
  clientChatId: string;
  @Field(() => String)
  providerIntegrationId: string;
  @Field(() => String)
  workspaceId: string;
}
