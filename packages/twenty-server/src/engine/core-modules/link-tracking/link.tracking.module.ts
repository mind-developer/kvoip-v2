import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Agent } from 'src/engine/core-modules/agent/agent.entity';
import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { SectorService } from 'src/engine/core-modules/sector/sector.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

import { LinkTrackingIntegration } from './link.tracking.entity';
import { LinkTrackingResolver } from './link.tracking.resolver';
import { LinkTrackingService } from './link.tracking.service';

@Module({
  imports: [
    // Configuração do NestjsQueryGraphQLModule
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [LinkTrackingIntegration, Workspace, Agent, Sector, Inbox],
          'core',
        ),
      ],
    }),

    // Módulos adicionais
    WorkspaceModule,
    EnvironmentModule,

    // Configuração do TypeOrmModule para outras entidades
    TypeOrmModule.forFeature([KeyValuePair], 'core'),
  ],
  exports: [LinkTrackingService],
  providers: [
    LinkTrackingService,
    LinkTrackingResolver,
    TypeORMService,
    SectorService,
  ],
})
export class LinkTrackingModule {}
