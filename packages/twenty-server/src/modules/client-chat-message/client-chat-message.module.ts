/* @kvoip-woulz proprietary */
import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';
import { ClientChatMessageResolver } from './client-chat-message.resolver';

@Module({
  imports: [FileModule, TwentyConfigModule],
  providers: [
    {
      provide: 'CLIENT_CHAT_MESSAGE_PUB_SUB',
      inject: [RedisClientService],

      useFactory: (redisClientService: RedisClientService) =>
        new RedisPubSub({
          publisher: redisClientService.getClient().duplicate(),
          subscriber: redisClientService.getClient().duplicate(),
        }),
    },
    ClientChatMessageService,
    ClientChatMessageResolver,
  ],
  exports: ['CLIENT_CHAT_MESSAGE_PUB_SUB', ClientChatMessageService],
})
export class ClientChatMessageModule implements OnModuleDestroy {
  constructor(
    @Inject('CLIENT_CHAT_MESSAGE_PUB_SUB') private readonly pubSub: RedisPubSub,
  ) {}

  async onModuleDestroy() {
    if (this.pubSub) {
      await this.pubSub.close();
    }
  }
}
