/* @kvoip-woulz proprietary */
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerResolver } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.resolver';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
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
    MessageQueueModule,
    ClientChatMessageModule,
  ],
  providers: [
    ChatMessageManagerResolver,
    ChatMessageManagerService,
    GoogleStorageService,
    ClientChatMessageService,
    FileService,
    JwtService,
    JwtWrapperService,
  ],
  exports: [ChatMessageManagerService],
})
export class ChatMessageManagerModule {}
