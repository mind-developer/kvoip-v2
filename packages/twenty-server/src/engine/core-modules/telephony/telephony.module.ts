/* eslint-disable no-restricted-imports */
/* @kvoip-woulz proprietary */
import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { PabxService } from 'src/engine/core-modules/telephony/services/pabx.service';
import { TelephonyService } from 'src/engine/core-modules/telephony/services/telephony.service';
import { TelephonyResolver } from 'src/engine/core-modules/telephony/telephony.resolver';
import { WorkspaceTelephonyService } from 'src/engine/core-modules/workspace/services/workspace-telephony.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { SoapClientModule } from 'src/modules/soap-client/soap-client.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Workspace]),
        TypeORMModule,
      ],
    }),
    DataSourceModule,
    forwardRef(() => WorkspaceModule),
    SoapClientModule,
  ],
  exports: [TelephonyService, PabxService],
  providers: [
    TelephonyService, 
    TelephonyResolver, 
    PabxService, 
    WorkspaceTelephonyService
  ],
})
export class TelephonyModule {}
