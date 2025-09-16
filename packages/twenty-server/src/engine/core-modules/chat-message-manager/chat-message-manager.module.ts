import { Module } from '@nestjs/common';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { SendMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-send.job';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([], 'core'), TypeORMModule],
    }),
    MessageQueueModule,
  ],
  providers: [ChatMessageManagerService, SendMessageJob],
  exports: [ChatMessageManagerService, SendMessageJob],
})
export class ChatbotFlowModule {}
