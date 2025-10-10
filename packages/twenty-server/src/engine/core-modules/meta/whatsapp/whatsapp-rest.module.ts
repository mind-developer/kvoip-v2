import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/TextInputHandler';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { Workspace } from '../../workspace/workspace.entity';
import { WhatsappRestController } from './whatsapp-rest.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [
    TypeORMModule,
    WorkspaceModule,
    NestjsQueryTypeOrmModule.forFeature([Workspace]),
    MessageQueueModule,
  ],
  controllers: [WhatsappRestController],
  providers: [
    WhatsAppService,
    GoogleStorageService,
    ChatbotRunnerService,
    ChatMessageManagerService,
    TextInputHandler,
    ImageInputHandler,
    ConditionalInputHandler,
    FileInputHandler,
    FileService,
    JwtService,
    JwtWrapperService,
  ],
  exports: [],
})
export class WhatsappRestModule {}
