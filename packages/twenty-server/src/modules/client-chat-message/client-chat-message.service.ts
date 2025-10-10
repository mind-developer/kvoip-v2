import { Inject, Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ClientChat, ClientChatMessage } from 'twenty-shared/types';

@Injectable()
export class ClientChatMessageService {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  async publishMessageCreated(message: ClientChatMessage, channel: string) {
    this.pubSub.publish(channel, message);
  }
  async publishChatCreated(chat: ClientChat, channel: string) {
    this.pubSub.publish(channel, chat);
  }
  async publishMessageUpdated(message: ClientChatMessage, channel: string) {
    this.pubSub.publish(channel, message);
  }
  async publishChatUpdated(chat: ClientChat, channel: string) {
    this.pubSub.publish(channel, chat);
  }
}
