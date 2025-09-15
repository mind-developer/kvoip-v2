import { Module } from '@nestjs/common';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowService } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.service';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/TextInputHandler';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { MessageManagerService } from 'src/engine/core-modules/meta/whatsapp/message-manager/message-manager.service';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { Inbox } from '../../inbox/inbox.entity';
import { Sector } from '../../sector/sector.entity';
import { WorkspaceAgent } from '../../workspace-agent/workspace-agent.entity';
import { Workspace } from '../../workspace/workspace.entity';
import { WhatsappIntegration } from './integration/whatsapp-integration.entity';
import { WhatsappIntegrationService } from './integration/whatsapp-integration.service';
import { WhatsappRestController } from './whatsapp-rest.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [
    TypeORMModule,
    WorkspaceModule,
    NestjsQueryTypeOrmModule.forFeature(
      [
        ChatbotFlow,
        WhatsappIntegration,
        Workspace,
        Inbox,
        Sector,
        WorkspaceAgent,
      ],
      'core',
    ),
  ],
  controllers: [WhatsappRestController],
  providers: [
    WhatsappIntegrationService,
    WhatsappService,
    InboxService,
    GoogleStorageService,
    FirebaseService,
    ChatbotFlowService,
    MessageManagerService,
    TextInputHandler,
    ImageInputHandler,
    ConditionalInputHandler,
    FileInputHandler,
    MessageManagerService,
  ],
  exports: [],
})
export class WhatsappRestModule {}
