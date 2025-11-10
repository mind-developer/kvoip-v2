import { Module } from '@nestjs/common';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerModule } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.module';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/TextInputHandler';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([]), TypeORMModule],
    }),
    ChatMessageManagerModule,
  ],
  providers: [
    ConditionalInputHandler,
    FileInputHandler,
    ImageInputHandler,
    TextInputHandler,
  ],
  exports: [
    ConditionalInputHandler,
    FileInputHandler,
    ImageInputHandler,
    TextInputHandler,
  ],
})
export class HandlersModule {}
