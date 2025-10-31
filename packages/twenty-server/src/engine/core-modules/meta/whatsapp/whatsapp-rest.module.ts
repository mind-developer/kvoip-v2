import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerModule } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.module';
import { ChatbotRunnerModule } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { ClientChatMessageModule } from 'src/modules/client-chat-message/client-chat-message.module';
import { Workspace } from '../../workspace/workspace.entity';
import { WhatsappRestController } from './whatsapp-rest.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [
    TypeORMModule,
    WorkspaceModule,
    NestjsQueryTypeOrmModule.forFeature([Workspace, FileEntity]),
    MessageQueueModule,
    ClientChatMessageModule,
    TwentyConfigModule,
    ChatbotRunnerModule,
    ChatMessageManagerModule,
    FileModule,
  ],
  controllers: [WhatsappRestController],
  providers: [WhatsAppService, JwtService, JwtWrapperService],
  exports: [],
})
export class WhatsappRestModule {}
