/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowResolver } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.resolver';
import { ChatbotFlowService } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.service';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/FileInputHandler';
import { HandlersModule } from 'src/engine/core-modules/chatbot-flow/engine/handlers/handlers.module';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/TextInputHandler';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [Workspace, ChatbotFlow, HandlersModule],
          'core',
        ),
        TypeORMModule,
      ],
    }),
    WorkspaceModule,
  ],
  providers: [
    ChatbotFlowService,
    ChatbotFlowResolver,
    ChatMessageManagerService,
    TextInputHandler,
    ImageInputHandler,
    ConditionalInputHandler,
    FileInputHandler,
  ],
  exports: [ChatbotFlowService],
})
export class ChatbotFlowModule {}
