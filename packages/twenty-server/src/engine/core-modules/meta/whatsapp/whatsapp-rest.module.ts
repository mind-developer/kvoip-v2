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
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { Inbox } from '../../inbox/inbox.entity';
import { Sector } from '../../sector/sector.entity';
import { WorkspaceAgent } from '../../workspace-agent/workspace-agent.entity';
import { Workspace } from '../../workspace/workspace.entity';
import { WhatsappIntegration } from './integration/whatsapp-integration.entity';
import { WhatsappIntegrationService } from './integration/whatsapp-integration.service';
import { WhatsappRestController } from './whatsapp-rest.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [
    TypeORMModule,
    WorkspaceModule,
    NestjsQueryTypeOrmModule.forFeature([
      WhatsappIntegration,
      Workspace,
      Inbox,
      Sector,
      WorkspaceAgent,
    ]),
    MessageQueueModule,
  ],
  controllers: [WhatsappRestController],
  providers: [
    WhatsappIntegrationService,
    WhatsAppService,
    InboxService,
    GoogleStorageService,
    FirebaseService,
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
