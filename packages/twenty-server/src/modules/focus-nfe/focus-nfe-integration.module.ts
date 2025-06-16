import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FocusNfeIntegration } from 'src/modules/focus-nfe/focus-nfe-integration.entity';
import { FocusNfeResolver } from 'src/modules/focus-nfe/focus-nfe-integration.resolver';
import { FocusNfeService } from 'src/modules/focus-nfe/focus-nfe-integration.service';
import { FocusNfeController } from 'src/modules/focus-nfe/focus-nfe-webhook.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [FocusNfeIntegration, Workspace],
          'core',
        ),
        TypeORMModule,
      ],
    }),
    DataSourceModule,
    forwardRef(() => WorkspaceModule),
  ],
  exports: [FocusNfeService],
  controllers: [FocusNfeController],
  providers: [FocusNfeResolver, FocusNfeService, TypeORMService],
})
export class FocusNfeModule {}
