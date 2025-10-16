/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerModule } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.module';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/FileInputHandler';
import { HandlersModule } from 'src/engine/core-modules/chatbot-runner/engine/handlers/handlers.module';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/TextInputHandler';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Workspace, HandlersModule]),
        TypeORMModule,
      ],
    }),
    WorkspaceModule,
    ChatMessageManagerModule,
  ],
  providers: [
    ChatbotRunnerService,
    TextInputHandler,
    ImageInputHandler,
    ConditionalInputHandler,
    FileInputHandler,
    GoogleStorageService,
  ],
  exports: [ChatbotRunnerService],
})
export class ChatbotRunnerModule {}
