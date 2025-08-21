// import { Logger, Scope } from '@nestjs/common';
// import { FinancialClosingService } from 'src/engine/core-modules/financial-closing/financial-closing.service';
// import { getAmountToBeChargedToCompanies, getCompaniesForFinancialClosing } from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';

// import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
// import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
// import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
// import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
// // import { ChargeService } from 'src/modules/charges/services/charge.service';

// export type RunFinancialClosingJob = {
//   financialClosingId: string;
//   workspaceId: string;
// };

// @Processor({
//   queueName: MessageQueue.cronQueue,
//   scope: Scope.DEFAULT,
// })
// export class RunFinancialClosingJobProcessor {
//   private readonly logger = new Logger(RunFinancialClosingJobProcessor.name);
  
//   constructor(
//     private readonly financialClosingService: FinancialClosingService,
//     private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
//   ) {}

//   @Process(RunFinancialClosingJobProcessor.name)
//   async handle(data: RunFinancialClosingJob): Promise<void> {
//     const { financialClosingId, workspaceId } = data;

//     this.logger.log(`1 Running financial closing CRON for workspace ${workspaceId} with ID ${financialClosingId} ----------------------------|`);
    
//     const financialClosing = await this.financialClosingService.findById(financialClosingId);

//     if (!financialClosing) {
//       this.logger.log(`Financial closing with ID ${financialClosingId} not found.`);
//       return;
//     }
    
//     try {
//       const companies = await getCompaniesForFinancialClosing(workspaceId, this.twentyORMGlobalManager, financialClosing);

//       const companiesWithAmount = await getAmountToBeChargedToCompanies(workspaceId, this.twentyORMGlobalManager, companies, financialClosing);

//       this.logger.log(`Companies to be charged: ${companiesWithAmount.length}`);
//       this.logger.log(JSON.stringify(companiesWithAmount, null, 2));

//     } catch (error) {
//       this.logger.log(`Error processing financial closing for workspace ${workspaceId}: ${error.message}`, error.stack);
//     }
//   }
// }


import { Logger, Scope } from '@nestjs/common';
import { RunCompanyFinancialClosingJobProcessor } from 'src/engine/core-modules/financial-closing/cron/jobs/run-company-financial-closing-processor.job';
import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
import { FinancialClosingService } from 'src/engine/core-modules/financial-closing/financial-closing.service';
import { getAmountToBeChargedToCompanies, getCompaniesForFinancialClosing } from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

export type RunFinancialClosingJob = {
  financialClosingId: string;
  workspaceId: string;
};

export type CompanyFinancialClosingJobData = {
  financialClosing: FinancialClosing;
  workspaceId: string;
  company: CompanyWorkspaceEntity;
  amountToBeCharged: number;
  billingModel: string;
};

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.DEFAULT,
})
export class RunFinancialClosingJobProcessor {
  private readonly logger = new Logger(RunFinancialClosingJobProcessor.name);
  
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)

    private readonly messageQueueService: MessageQueueService,
    private readonly financialClosingService: FinancialClosingService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(RunFinancialClosingJobProcessor.name)
  async handle(data: RunFinancialClosingJob): Promise<void> {
    const { financialClosingId, workspaceId } = data;

    this.logger.log(`Running financial closing CRON for workspace ${workspaceId} with ID ${financialClosingId} ----------------------------|`);
    
    const financialClosing = await this.financialClosingService.findById(financialClosingId);

    if (!financialClosing) {
      this.logger.warn(`Financial closing with ID ${financialClosingId} not found.`);
      return;
    }
    
    try {
      const companies = await getCompaniesForFinancialClosing(workspaceId, this.twentyORMGlobalManager, financialClosing);
      const companiesWithAmount = await getAmountToBeChargedToCompanies(workspaceId, this.twentyORMGlobalManager, companies, financialClosing);

      this.logger.log(`Companies to be charged: ${companiesWithAmount.length}`);


      for (const company of companiesWithAmount) {
        await this.messageQueueService.add<CompanyFinancialClosingJobData>(
          RunCompanyFinancialClosingJobProcessor.name,
          {
            financialClosing,
            workspaceId,
            company: company.data,
            amountToBeCharged: company.amountToBeCharged,
            billingModel: company.billingModel,
          },
          // { attempts: 3, removeOnComplete: true }
        );
      }

    } catch (error) {
      this.logger.error(
        `Error processing financial closing for workspace ${workspaceId}: ${error.message}`,
        error.stack
      );
    }
  }
}
