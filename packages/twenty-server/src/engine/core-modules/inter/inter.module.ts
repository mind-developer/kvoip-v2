import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { InterConnection } from 'src/engine/core-modules/inter/inter.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

import { InterService } from './services/inter.service';

import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { interConnectionAutoResolverOpts } from './inter.auto-resolver-opts';
import { InterResolver } from './inter.resolver';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [InterConnection, Workspace],
          'core',
        ),
        TypeORMModule,
        FileModule,
        WorkspaceModule,
      ],
      resolvers: interConnectionAutoResolverOpts,
    }),
    DataSourceModule,
    FileUploadModule,
    WorkspaceModule,
    DomainManagerModule,
  ],
  exports: [InterService],
  providers: [InterService, InterResolver],
})
export class InterModule {}
