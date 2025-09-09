import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FocusNfeIntegration } from 'src/modules/focus-nfe/focus-nfe-integration.entity';
import { FocusNFeIntegrationResolver } from 'src/modules/focus-nfe/focus-nfe-integration.resolver';
import { FocusNFeIntegrationService } from 'src/modules/focus-nfe/focus-nfe-integration.service';
import { FocusNfeController } from 'src/modules/focus-nfe/focus-nfe-webhook.controller';
import { FocusNFeEventListener } from 'src/modules/focus-nfe/focus-nfe.listener';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';
import { NotaFiscalEventListener } from 'src/modules/nota-fiscal/nota-fiscal.listener';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([FocusNfeIntegration, Workspace]),
        TypeORMModule,
      ],
    }),
    FileModule,
    FileUploadModule,
    FileStorageModule,
    DataSourceModule,
    forwardRef(() => WorkspaceModule),
  ],
  exports: [FocusNFeIntegrationService],
  controllers: [FocusNfeController],
  providers: [
    FocusNFeIntegrationResolver,
    FocusNFeIntegrationService,
    FocusNFeService,
    FocusNFeEventListener,
    NotaFiscalEventListener,
  ],
})
export class FocusNfeModule {}
