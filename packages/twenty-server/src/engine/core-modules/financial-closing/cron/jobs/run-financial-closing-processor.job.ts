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
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FinancialClosingExecutionStatusEnum } from 'src/modules/financial-closing-execution/constants/financial-closing-execution-status.constants';
import { FinancialClosingExecutionWorkspaceEntity } from 'src/modules/financial-closing-execution/standard-objects/financial-closing-execution.workspace-entity';
import { addFinancialClosingExecutionLog } from 'src/modules/financial-closing-execution/utils/financial-closing-execution-utils';
import { In, Repository } from 'typeorm';

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
  executionLog: FinancialClosingExecutionWorkspaceEntity;
  companyExecutionLog: CompanyFinancialClosingExecutionWorkspaceEntity;
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

    const financialClosingExecutionsRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FinancialClosingExecutionWorkspaceEntity>(
        workspaceId,
        'financialClosingExecution',
        {
          shouldBypassPermissionChecks: true,
        },
      );
  
    let newExecutionLog = financialClosingExecutionsRepository.create({
      name: `Execução do fechamento ${financialClosing.id}`,
      executedAt: new Date(),
      billingModelIds: financialClosing.billingModelIds,
      financialClosingId: financialClosing.id,
    });

    newExecutionLog = await financialClosingExecutionsRepository.save(newExecutionLog);

    this.logger.log(`newExecutionLog: ${JSON.stringify(newExecutionLog, null, 2)}`);

    await addFinancialClosingExecutionLog(
      newExecutionLog,
      financialClosingExecutionsRepository,
      'info',
      `Iniciando execução do fechamento ${financialClosing.id}`,
    );

    // -------------------------------------------------------

    // const companyFinancialClosingExecutionsRepository =
    //   await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
    //     workspaceId,
    //     'companyFinancialClosingExecution',
    //     {
    //       shouldBypassPermissionChecks: true,
    //     },
    //   );

    // let newCompanyExecutionLog = companyFinancialClosingExecutionsRepository.create({
    //   name: `Execução do fechamento ${financialClosing.id} - Company`,
    //   executedAt: new Date(),
    //   // financialClosingExecution: null,
    //   financialClosingExecutionId: newExecutionLog.id,
    //   status: FinancialClosingExecutionStatusEnum.PENDING, // ou 'RUNNING' | 'SUCCESS' | 'FAILED'
    //   companyId: 'company-uuid-5678',
    //   chargeValue: 1500.75,
    // });

    // newCompanyExecutionLog = await companyFinancialClosingExecutionsRepository.save(newCompanyExecutionLog);
    
    // this.logger.log(`COMPANY FINANCIAL CLOSING EXECUTION LOG: ${JSON.stringify(newCompanyExecutionLog, null, 2)}`);
    
    try {
      const companies = await getCompaniesForFinancialClosing(workspaceId, this.twentyORMGlobalManager, financialClosing);

      await financialClosingExecutionsRepository.update(newExecutionLog.id, {
        companiesTotal: companies.length,
        completedCompanySearch: true,
      });

      const companiesWithAmount = await getAmountToBeChargedToCompanies(
        workspaceId, 
        this.twentyORMGlobalManager, 
        companies, 
        financialClosing
      );

      await financialClosingExecutionsRepository.update(newExecutionLog.id, { completedCostIdentification: true,});

      this.logger.log(`Companies to be charged: ${companiesWithAmount.length}`);

      const companyFinancialClosingExecutionsRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
          workspaceId,
          'companyFinancialClosingExecution',
          { shouldBypassPermissionChecks: true },
        );

      for (const company of companiesWithAmount) {

        let newCompanyExecution = companyFinancialClosingExecutionsRepository.create({
          name: `Execução do fechamento ${financialClosing.id} - ${company.data.name}`,
          executedAt: new Date(),
          financialClosingExecutionId: newExecutionLog.id,
          companyId: company.data.id,
          chargeValue: company.amountToBeCharged,
          calculatedChargeValue: true,
          invoiceEmissionType: company.data.typeEmissionNF, // se existir no objeto
        });

        newCompanyExecution = await companyFinancialClosingExecutionsRepository.save(newCompanyExecution);

        try {
          await this.messageQueueService.add<CompanyFinancialClosingJobData>(
            RunCompanyFinancialClosingJobProcessor.name,
            {
              financialClosing,
              workspaceId,
              company: company.data,
              amountToBeCharged: company.amountToBeCharged,
              billingModel: company.billingModel,
              executionLog: newExecutionLog,
              companyExecutionLog: newCompanyExecution,
            },
            // { attempts: 3, removeOnComplete: true }
          );

        } catch (jobError) {

          this.logger.error(`Error adding job for company ${company.data.id}: ${jobError.message}`, jobError.stack);

          await addFinancialClosingExecutionLog(
            newExecutionLog,
            financialClosingExecutionsRepository,
            'error',
            `Erro ao adicionar job para a empresa ${company.data.id}: ${jobError.message}`,
          );

          await addFinancialClosingExecutionLog(
            newCompanyExecution,
            companyFinancialClosingExecutionsRepository,
            'error',
            `Erro na emissão: ${company.data.id}: ${jobError.message}`,
          );

          await financialClosingExecutionsRepository.increment(
            { id: newExecutionLog.id },
            'companiesWithError',
            1
          );
        }
      }

      await financialClosingExecutionsRepository.update(newExecutionLog.id, {
        status: FinancialClosingExecutionStatusEnum.SUCCESS,
      });

    } catch (error) {

      await financialClosingExecutionsRepository.update(newExecutionLog.id, {
        status: FinancialClosingExecutionStatusEnum.ERROR,
      });

      await addFinancialClosingExecutionLog(
        newExecutionLog,
        financialClosingExecutionsRepository,
        'error',
        `Erro fatal na execução do fechamento: ${error.message}`,
      );
    }
  }
}
