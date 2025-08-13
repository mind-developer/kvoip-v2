import { Logger, Scope } from '@nestjs/common';
import { CompanyFinancialClosingJobData } from 'src/engine/core-modules/financial-closing/cron/jobs/run-financial-closing-processor.job';
import { FinancialClosingChargeService } from 'src/engine/core-modules/financial-closing/financial-closing-charge.service';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.DEFAULT,
})
export class RunCompanyFinancialClosingJobProcessor {
  private readonly logger = new Logger(RunCompanyFinancialClosingJobProcessor.name);

  constructor(
    private readonly financialClosingChargeService: FinancialClosingChargeService,
  ) {}

  @Process(RunCompanyFinancialClosingJobProcessor.name)
  async handle(data: CompanyFinancialClosingJobData): Promise<void> {
    this.logger.log(
      `🏦 🏦 🏦 🏦 🏦 🏦 2 Processing company for financial closing ${data.financialClosingId} in workspace ${data.workspaceId}`
    );

    this.logger.log(`Company: ${JSON.stringify(data.company, null, 2)}`);
    this.logger.log(`Amount to be charged: ${data.amountToBeCharged}`);
    this.logger.log(`Billing model: ${data.billingModel}`);

    await this.financialClosingChargeService.test();

    await this.financialClosingChargeService.emitChargeForCompany(
      data.workspaceId,
      data.company,
      data.amountToBeCharged,
      data.financialClosing,
    );

    // Aqui você coloca a lógica para cobrar/processar cada empresa individualmente
  }
}

