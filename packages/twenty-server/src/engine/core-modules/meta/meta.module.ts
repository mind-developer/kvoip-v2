/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerModule } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.module';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ChatbotRunnerModule } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { WhatsappController } from 'src/engine/core-modules/meta/whatsapp/whatsapp.controller';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { ClientChatMessageModule } from 'src/modules/client-chat-message/client-chat-message.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Workspace]),
        TypeORMModule,
      ],
    }),
    WorkspaceModule,
    MessageQueueModule,
    ClientChatMessageModule,
    ChatbotRunnerModule,
    TwentyConfigModule,
    FileModule,
    ChatMessageManagerModule,
  ],
  exports: [WhatsAppService],
  controllers: [WhatsappController],
  providers: [
    WhatsAppService,
    ChatMessageManagerService,
    JwtService,
    JwtWrapperService,
  ],
})
export class MetaModule {}
