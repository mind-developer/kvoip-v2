import { Module } from '@nestjs/common';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { SaveChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-save.job';
import { SendChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-send.job';
import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowService } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.service';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/TextInputHandler';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { WorkspaceAgent } from 'src/engine/core-modules/workspace-agent/workspace-agent.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [
            Workspace,
            Inbox,
            Sector,
            WorkspaceAgent,
            ChatbotFlow,
            WhatsappIntegration,
          ],
          'core',
        ),
        TypeORMModule,
      ],
    }),
    MessageQueueModule,
  ],
  providers: [
    ChatMessageManagerService,
    WhatsAppService,
    GoogleStorageService,
    FirebaseService,
    ChatbotFlowService,
    TextInputHandler,
    ImageInputHandler,
    ConditionalInputHandler,
    FileInputHandler,
    SaveChatMessageJob,
    SendChatMessageJob,
  ],
  exports: [ChatMessageManagerService],
})
export class ChatMessageManagerModule {}
