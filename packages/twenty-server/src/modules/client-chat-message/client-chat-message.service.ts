import { Inject, Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ClientChat, ClientChatMessage } from 'twenty-shared/types';
import { ClientChatEvent, ClientChatEventDTO } from './dtos/on-chat-event.dto';
import {
  ClientMessageEvent,
  ClientMessageEventDTO,
} from './dtos/on-client-message-event.dto';

@Injectable()
export class ClientChatMessageService {
  constructor(
    @Inject('CLIENT_CHAT_MESSAGE_PUB_SUB') public readonly pubSub: RedisPubSub,
  ) {}

  async publishMessageCreated(
    message: ClientChatMessage,
    chatId: string,
  ): Promise<void> {
    const channel = `client-message-${chatId}`;
    const eventData: ClientMessageEventDTO = {
      event: ClientMessageEvent.CREATED,
      clientChatMessageEventDate: new Date(),
      clientChatMessage: message,
    };

    await this.pubSub.publish(channel, eventData);
  }

  async publishChatCreated(chat: ClientChat, sectorId: string): Promise<void> {
    const channel = `client-chat-${sectorId}`;
    const eventData: ClientChatEventDTO = {
      event: ClientChatEvent.CREATED,
      clientChatEventDate: new Date(),
      clientChat: chat,
    };

    await this.pubSub.publish(channel, eventData);
  }

  async publishMessageUpdated(
    message: ClientChatMessage,
    chatId: string,
  ): Promise<void> {
    const channel = `client-message-${chatId}`;
    const eventData: ClientMessageEventDTO = {
      event: ClientMessageEvent.UPDATED,
      clientChatMessageEventDate: new Date(),
      clientChatMessage: message,
    };

    await this.pubSub.publish(channel, eventData);
  }

  async publishChatUpdated(chat: ClientChat, sectorId: string): Promise<void> {
    const channel = `client-chat-${sectorId}`;
    const eventData: ClientChatEventDTO = {
      event: ClientChatEvent.UPDATED,
      clientChatEventDate: new Date(),
      clientChat: chat,
    };

    await this.pubSub.publish(channel, eventData);
  }
}
