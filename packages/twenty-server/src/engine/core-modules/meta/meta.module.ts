/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Agent } from 'src/engine/core-modules/agent/agent.entity';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsappIntegrationResolver } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.resolver';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';
import { WhatsappController } from 'src/engine/core-modules/meta/whatsapp/whatsapp.controller';
import { WhatsappResolver } from 'src/engine/core-modules/meta/whatsapp/whatsapp.resolver';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [WhatsappIntegration, Workspace, Inbox, Sector, Agent],
          'core',
        ),
        TypeORMModule,
      ],
    }),
    WorkspaceModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    TypeOrmModule.forFeature([KeyValuePair], 'core'),
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
