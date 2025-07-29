import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
import { FinancialClosingResolver } from 'src/engine/core-modules/financial-closing/financial-closing.resolver';
import { FinancialClosingService } from 'src/engine/core-modules/financial-closing/financial-closing.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([FinancialClosing, Workspace], 'core'),
        TypeORMModule,
      ],
    }),
    forwardRef(() => WorkspaceModule),
  ],
  exports: [FinancialClosingService],
  providers: [FinancialClosingService, FinancialClosingResolver, TypeORMService],
})
export class FinancialClosingModule {}
