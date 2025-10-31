import { Inject, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { OnChatEventInput } from 'src/modules/client-chat-message/dtos/on-chat-event.input';
import { ClientChatEventDTO } from './dtos/on-chat-event.dto';
import { OnChatMessageEventInput } from './dtos/on-chat-message-event.input';
import { ClientMessageEventDTO } from './dtos/on-client-message-event.dto';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class ClientChatMessageResolver {
  constructor(
    @Inject('CLIENT_CHAT_MESSAGE_PUB_SUB') private readonly pubSub: RedisPubSub,
  ) {}

  @Subscription(() => ClientMessageEventDTO, {
    resolve: (payload) => payload,
  })
  async onClientMessageEvent(
    @Args('input') input: OnChatMessageEventInput,
  ): Promise<AsyncIterator<ClientMessageEventDTO>> {
    const chatIdChannel = `client-message-${input.chatId}`;
    return this.pubSub.asyncIterator(chatIdChannel);
  }

  @Subscription(() => ClientChatEventDTO, {
    resolve: (payload) => payload,
  })
  async onClientChatEvent(
    @Args('input') input: OnChatEventInput,
  ): Promise<AsyncIterator<ClientChatEventDTO>> {
    const sectorIdChannel = `client-chat-${input.sectorId}`;
    return this.pubSub.asyncIterator(sectorIdChannel);
  }
}
