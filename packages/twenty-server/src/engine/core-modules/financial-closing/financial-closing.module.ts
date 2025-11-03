import { Module, forwardRef } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { RunCompanyFinancialClosingJobProcessor } from 'src/engine/core-modules/financial-closing/cron/jobs/run-company-financial-closing-processor.job';
import { RunFinancialClosingJobProcessor } from 'src/engine/core-modules/financial-closing/cron/jobs/run-financial-closing-processor.job';
import { FinancialClosingChargeService } from 'src/engine/core-modules/financial-closing/financial-closing-charge.service';
import { FinancialClosingNFService } from 'src/engine/core-modules/financial-closing/financial-closing-focusnf.service';
import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
import { FinancialClosingResolver } from 'src/engine/core-modules/financial-closing/financial-closing.resolver';
import { FinancialClosingService } from 'src/engine/core-modules/financial-closing/financial-closing.service';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterModule } from 'src/engine/core-modules/inter/inter.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';

@Module({
  imports: [
    forwardRef(() => InterModule),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([
          FinancialClosing,
          Workspace,
          InterIntegration,
        ]),
        TypeORMModule,
      ],
    }),
    FileModule,
    FileUploadModule,
  ],
  exports: [
    FinancialClosingService,
    FinancialClosingChargeService,
    FinancialClosingNFService,
  ],
  providers: [
    FinancialClosingService,
    FinancialClosingChargeService,
    FinancialClosingNFService,
    FocusNFeService,
    FinancialClosingResolver,
    RunFinancialClosingJobProcessor,
    RunCompanyFinancialClosingJobProcessor,
  ],
})
export class FinancialClosingModule {}
