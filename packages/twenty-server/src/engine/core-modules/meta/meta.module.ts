/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowService } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.service';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/TextInputHandler';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { WhatsappCronCommand } from 'src/engine/core-modules/meta/whatsapp/cron/command/whatsapp.cron.command';
import { WhatsappEmmitResolvedchatsJob } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-resolved-chats.job';
import { WhatsappEmmitWaitingStatusJob } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-waiting-status.job';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsappIntegrationResolver } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.resolver';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';
import { MessageManagerService } from 'src/engine/core-modules/meta/whatsapp/message-manager/message-manager.service';
import { WhatsappController } from 'src/engine/core-modules/meta/whatsapp/whatsapp.controller';
import { WhatsappResolver } from 'src/engine/core-modules/meta/whatsapp/whatsapp.resolver';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { WorkspaceAgent } from 'src/engine/core-modules/workspace-agent/workspace-agent.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [
            WhatsappIntegration,
            Workspace,
            Inbox,
            Sector,
            WorkspaceAgent,
            ChatbotFlow,
          ],
          'core',
        ),
        TypeORMModule,
      ],
    }),
    WorkspaceModule,
    MessageQueueModule,
  ],
  exports: [WhatsappService],
  controllers: [WhatsappController],
  providers: [
    ChatbotFlowService,
    TypeORMService,
    WhatsappIntegrationService,
    WhatsappIntegrationResolver,
    InboxService,
    WhatsappService,
    WhatsappResolver,
    GoogleStorageService,
    FirebaseService,
    WhatsappEmmitWaitingStatusJob,
    WhatsappEmmitResolvedchatsJob,
    WhatsappCronCommand,
    MessageManagerService,
    TextInputHandler,
    ImageInputHandler,
    ConditionalInputHandler,
    FileInputHandler,
  ],
})
export class MetaModule {}
