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
}
