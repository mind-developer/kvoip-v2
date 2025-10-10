import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { SaveClientChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-save.job';
import { SendChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-send.job';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/TextInputHandler';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Workspace]),
        TypeORMModule,
      ],
    }),
    MessageQueueModule,
  ],
  providers: [
    ChatMessageManagerService,
    WhatsAppService,
    GoogleStorageService,
    ChatbotRunnerService,
    TextInputHandler,
    ImageInputHandler,
    ConditionalInputHandler,
    FileInputHandler,
    SaveClientChatMessageJob,
    SendChatMessageJob,
    FileService,
    JwtService,
    JwtWrapperService,
  ],
  exports: [ChatMessageManagerService],
})
export class ChatMessageManagerModule {}
