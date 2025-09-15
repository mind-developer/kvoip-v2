import { Module } from '@nestjs/common';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/TextInputHandler';
import { MessageManagerService } from 'src/engine/core-modules/meta/whatsapp/message-manager/message-manager.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([], 'core'), TypeORMModule],
    }),
  ],
  providers: [
    ConditionalInputHandler,
    FileInputHandler,
    ImageInputHandler,
    TextInputHandler,
    MessageManagerService,
  ],
  exports: [
    ConditionalInputHandler,
    FileInputHandler,
    ImageInputHandler,
    TextInputHandler,
  ],
})
export class HandlersModule {}
