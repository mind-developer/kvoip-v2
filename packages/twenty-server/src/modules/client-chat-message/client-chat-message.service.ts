import { Inject, Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
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
    message: Omit<
      ClientChatMessageWorkspaceEntity,
      'updatedAt' | 'id' | 'clientChat' | 'deletedAt'
    >,
    chatId: string,
    publishTo: 'sector' | 'admin' | 'all' = 'all',
  ): Promise<void> {
    const eventData: ClientMessageEventDTO = {
      event: ClientMessageEvent.CREATED,
      clientChatMessageEventDate: new Date(),
      clientChatMessage: message,
    };

    if (publishTo === 'sector' || publishTo === 'all') {
      await this.pubSub.publish(`client-message-${chatId}`, eventData);
    }
    if (publishTo === 'admin' || publishTo === 'all') {
      await this.pubSub.publish('client-chat-admin', eventData);
    }
  }

  async publishChatCreated(
    chat: ClientChatWorkspaceEntity,
    sectorId: string,
    publishTo: 'sector' | 'admin' | 'all' = 'all',
  ): Promise<void> {
    const eventData: ClientChatEventDTO = {
      event: ClientChatEvent.CREATED,
      clientChatEventDate: new Date(),
      clientChat: chat,
    };

    if (publishTo === 'sector' || publishTo === 'all') {
      await this.pubSub.publish(`client-chat-${sectorId}`, eventData);
    }
    if (publishTo === 'admin' || publishTo === 'all') {
      await this.pubSub.publish('client-chat-admin', eventData);
    }
  }

  async publishMessageUpdated(
    message: ClientChatMessageWorkspaceEntity,
    chatId: string,
    publishTo: 'sector' | 'admin' | 'all' = 'all',
  ): Promise<void> {
    const eventData: ClientMessageEventDTO = {
      event: ClientMessageEvent.UPDATED,
      clientChatMessageEventDate: new Date(),
      clientChatMessage: message,
    };
    if (publishTo === 'sector' || publishTo === 'all') {
      await this.pubSub.publish(`client-message-${chatId}`, eventData);
    }

    if (publishTo === 'admin' || publishTo === 'all') {
      await this.pubSub.publish('client-chat-admin', eventData);
    }
  }

  async publishChatUpdated(
    chat: ClientChatWorkspaceEntity,
    sectorId: string,
    publishTo: 'sector' | 'admin' | 'all' = 'all',
  ): Promise<void> {
    const eventData: ClientChatEventDTO = {
      event: ClientChatEvent.UPDATED,
      clientChatEventDate: new Date(),
      clientChat: chat,
    };
    if (publishTo === 'sector' || publishTo === 'all') {
      await this.pubSub.publish(`client-chat-${sectorId}`, eventData);
    }
    if (publishTo === 'admin' || publishTo === 'all') {
      await this.pubSub.publish('client-chat-admin', eventData);
    }
  }

  async publishChatDeleted(
    chat: ClientChatWorkspaceEntity,
    sectorId: string,
    publishTo: 'sector' | 'admin' | 'all' = 'all',
  ): Promise<void> {
    const eventData: ClientChatEventDTO = {
      event: ClientChatEvent.DELETED,
      clientChatEventDate: new Date(),
      clientChat: chat,
    };
    if (publishTo === 'sector' || publishTo === 'all') {
      await this.pubSub.publish(`client-chat-${sectorId}`, eventData);
    }
    if (publishTo === 'admin' || publishTo === 'all') {
      await this.pubSub.publish('client-chat-admin', eventData);
    }
  }
}
