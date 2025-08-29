import { Logger, Scope } from '@nestjs/common';
import { TypeEmissionNFEnum } from 'src/engine/core-modules/financial-closing/constants/type-emission-nf.constants';
import { CompanyFinancialClosingJobData } from 'src/engine/core-modules/financial-closing/cron/jobs/run-financial-closing-processor.job';
import { FinancialClosingChargeService } from 'src/engine/core-modules/financial-closing/financial-closing-charge.service';
import { FinancialClosingNFService } from 'src/engine/core-modules/financial-closing/financial-closing-focusnf.service';

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
    private readonly financialClosingNFService: FinancialClosingNFService,
  ) {}

  @Process(RunCompanyFinancialClosingJobProcessor.name)
  async handle(data: CompanyFinancialClosingJobData): Promise<void> {
    this.logger.log(
      `🏦 🏦 🏦 🏦 🏦 🏦 2 Processing company for financial closing ${data.financialClosing.id} in workspace ${data.workspaceId}`
    );

    const charge = await this.financialClosingChargeService.emitChargeForCompany(
      data.workspaceId,
      data.company,
      data.amountToBeCharged,
      data.financialClosing,
    );

    // data.financialClosingExecutionsRepository

    // { // Caso emissão esteja desabilitada ou nao configurada na company
    //   data.company.typeEmissionNF == TypeEmissionNFEnum.BEFORE ? (

    //     await this.financialClosingNFService.emitNFForCompany(
    //       data.workspaceId,
    //       data.company,
    //       charge,
    //       data.financialClosing,
    //     )

    //   ) : (
    //     // Aqui deve atualizar os relatorios para nao emissao do boleto TODO
    //     null
    //   )
    // }

  }
}

