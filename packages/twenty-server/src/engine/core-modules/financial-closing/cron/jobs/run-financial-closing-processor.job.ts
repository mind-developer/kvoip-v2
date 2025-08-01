import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
// import { ChargeService } from 'src/modules/charges/services/charge.service';

export type RunFinancialClosingJob = {
  financialClosingId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.DEFAULT,
})
export class RunFinancialClosingJobProcessor {
  private readonly logger = new Logger(RunFinancialClosingJobProcessor.name);

  constructor(
    
  ) {}

  // @Process(/^RunFinancialClosingJobProcessor::.+$/) // <- escuta dinamicamente todos os jobs com nome baseado no ID

  @Process(RunFinancialClosingJobProcessor.name)
  async handle(data: RunFinancialClosingJob): Promise<void> {
    const { financialClosingId, workspaceId } = data;

    this.logger.log(`Running financial closing CRON for workspace ${workspaceId} with ID ${financialClosingId} ----------------------------|`);
    
    // Lógica para processar fechamento aqui
  }
}
