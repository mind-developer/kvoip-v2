/* @kvoip-woulz proprietary */
import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module'; // @kvoip-woulz proprietary
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module'; // @kvoip-woulz proprietary
import { FocusNfeIntegration } from 'src/modules/focus-nfe/focus-nfe-integration.entity';
import { FocusNFeIntegrationResolver } from 'src/modules/focus-nfe/focus-nfe-integration.resolver';
import { FocusNFeIntegrationService } from 'src/modules/focus-nfe/focus-nfe-integration.service';
import { FocusNfeController } from 'src/modules/focus-nfe/focus-nfe-webhook.controller';
import { FocusNFeEventListener } from 'src/modules/focus-nfe/focus-nfe.listener';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';
import { InvoiceEventListener } from 'src/modules/invoice/invoice.listener';

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
    RecordTransformerModule,
    ObjectMetadataModule,
    forwardRef(() => WorkspaceModule),
  ],
  exports: [FocusNFeIntegrationService],
  controllers: [FocusNfeController],
  providers: [
    FocusNFeIntegrationResolver,
    FocusNFeIntegrationService,
    FocusNFeService,
    FocusNFeEventListener,
    InvoiceEventListener,
  ],
})
export class FocusNfeModule {}
