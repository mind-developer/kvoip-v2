/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/TextInputHandler';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { WhatsappCronCommand } from 'src/engine/core-modules/meta/whatsapp/cron/command/whatsapp.cron.command';
import { WhatsappEmmitResolvedchatsJob } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-resolved-chats.job';
import { WhatsappEmmitWaitingStatusJob } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-waiting-status.job';
import { WhatsappController } from 'src/engine/core-modules/meta/whatsapp/whatsapp.controller';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { ClientChatMessageModule } from 'src/modules/client-chat-message/client-chat-message.module';
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';

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
    FileModule,
  ],
  exports: [WhatsAppService],
  controllers: [WhatsappController],
  providers: [
    ChatbotRunnerService,
    WhatsAppService,
    GoogleStorageService,
    WhatsappEmmitWaitingStatusJob,
    WhatsappEmmitResolvedchatsJob,
    WhatsappCronCommand,
    ChatMessageManagerService,
    TextInputHandler,
    ImageInputHandler,
    ConditionalInputHandler,
    FileInputHandler,
    FileService,
    JwtService,
    JwtWrapperService,
    ClientChatMessageService,
    ChatMessageManagerService,
  ],
})
export class MetaModule {}
