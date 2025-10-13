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
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  getPubSub() {
    return this.pubSub;
  }

  async publishMessageCreated(message: ClientChatMessage, chatId: string) {
    const eventData: ClientMessageEventDTO = {
      event: ClientMessageEvent.CREATED,
      clientChatMessageEventDate: new Date(),
      clientChatMessage: message,
    };

    this.pubSub.publish(`client-message-${chatId}`, eventData);
  }

  async publishChatCreated(chat: ClientChat, sectorId: string) {
    const eventData: ClientChatEventDTO = {
      event: ClientChatEvent.CREATED,
      clientChatEventDate: new Date(),
      clientChat: chat,
    };

    this.pubSub.publish(`client-chat-${sectorId}`, eventData);
  }

  async publishMessageUpdated(message: ClientChatMessage, chatId: string) {
    const eventData: ClientMessageEventDTO = {
      event: ClientMessageEvent.UPDATED,
      clientChatMessageEventDate: new Date(),
      clientChatMessage: message,
    };

    this.pubSub.publish(`client-message-${chatId}`, eventData);
  }

  async publishChatUpdated(chat: ClientChat, sectorId: string) {
    const eventData: ClientChatEventDTO = {
      event: ClientChatEvent.UPDATED,
      clientChatEventDate: new Date(),
      clientChat: chat,
    };

    this.pubSub.publish(`client-chat-${sectorId}`, eventData);
  }
}
