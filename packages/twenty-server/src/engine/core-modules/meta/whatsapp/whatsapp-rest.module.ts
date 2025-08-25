import { Module } from '@nestjs/common';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { WhatsappRestController, WhatsappRestController2 } from './whatsapp.controller';
import { WhatsappIntegrationService } from './integration/whatsapp-integration.service';
import { WhatsappService } from './whatsapp.service';
import { WhatsappIntegration } from './integration/whatsapp-integration.entity';
import { Workspace } from '../../workspace/workspace.entity';
import { Inbox } from '../../inbox/inbox.entity';
import { Sector } from '../../sector/sector.entity';
// import { Agent } from '../../agent/agent.entity';
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { WorkspaceAgent } from '../../workspace-agent/workspace-agent.entity';

@Module({
  imports: [
    TypeORMModule,
    WorkspaceModule,
    NestjsQueryTypeOrmModule.forFeature(
      [WhatsappIntegration, Workspace, Inbox, Sector, WorkspaceAgent],
      'core',
    ),
  ],
  controllers: [WhatsappRestController, WhatsappRestController2],
  providers: [WhatsappIntegrationService, WhatsappService, InboxService, GoogleStorageService, FirebaseService],
  exports: [],
})
export class WhatsappRestModule { }
