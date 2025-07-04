/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsappIntegrationResolver } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.resolver';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';
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
          [WhatsappIntegration, Workspace, Inbox, Sector, WorkspaceAgent],
          'core',
        ),
        TypeORMModule,
      ],
    }),
    WorkspaceModule,
  ],
  exports: [],
  controllers: [WhatsappController],
  providers: [
    TypeORMService,
    WhatsappIntegrationService,
    WhatsappIntegrationResolver,
    InboxService,
    WhatsappService,
    WhatsappResolver,
    GoogleStorageService,
    FirebaseService,
  ],
})
export class MetaModule {}
