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

    try {
      const companies = await getCompaniesForFinancialClosing(workspaceId, this.twentyORMGlobalManager, financialClosing);

      // Marco de finalização da busca de empresas
      await financialClosingExecutionsRepository.update(newExecutionLog.id, {
        companiesTotal: companies.length,
        completedCompanySearch: true,
      });

      const companyFinancialClosingExecutionsRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
          workspaceId,
          'companyFinancialClosingExecution',
          { shouldBypassPermissionChecks: true },
        );

      // Cria os logs iniciais de execuções para cada empresa
      const companyExecutions = new Map<string, CompanyFinancialClosingExecutionWorkspaceEntity>();
      
      for (const company of companies) {
        let newCompanyExecution = companyFinancialClosingExecutionsRepository.create({
          name: `Execução do fechamento ${financialClosing.id} - ${company.name}`,
          executedAt: new Date(),
          financialClosingExecutionId: newExecutionLog.id,
          companyId: company.id,
          status: FinancialClosingExecutionStatusEnum.PENDING,
        });

        newCompanyExecution = await companyFinancialClosingExecutionsRepository.save(newCompanyExecution);
        companyExecutions.set(company.id, newCompanyExecution);
      }

      const companiesWithAmount = await getAmountToBeChargedToCompanies(
        workspaceId, 
        this.twentyORMGlobalManager, 
        companies, 
        financialClosing,
        companyFinancialClosingExecutionsRepository,
        companyExecutions
      );

      // Marco de finalização do cálculo de custo
      await financialClosingExecutionsRepository.update(newExecutionLog.id, { completedCostIdentification: true,});
      
      // Identifica empresas que não foram obtidas os valores
      const companiesWithAmountIds = new Set(companiesWithAmount.map(company => company.data.id));
      const companiesWithoutAmount = companies.filter(company => !companiesWithAmountIds.has(company.id));
      
      // Atualiza o numero de empresas com erro se for diferente do numero de empresas obtidas
      if (companiesWithAmount.length !== companies.length) {
        const numberOfCompaniesWithError = companies.length - companiesWithAmount.length;
        await financialClosingExecutionsRepository.update(newExecutionLog.id, { companiesWithError: numberOfCompaniesWithError });
        
        // Cria log de aviso para cada empresa que não foi obtida o valor
        for (const company of companiesWithoutAmount) {
          await addFinancialClosingExecutionLog(
            newExecutionLog,
            financialClosingExecutionsRepository,
            'warn',
            `Erro para gerar cobrança para a empresa ${company.name} (${company.id})`
          );
        }
      }

      for (const company of companiesWithAmount) {

        // Buscar a execução já criada para esta empresa
        const companyExecution = companyExecutions.get(company.data.id);
        if (!companyExecution) {
          this.logger.error(`Execução não encontrada para empresa ${company.data.id}`);
          continue;
        }

        // Atualizar a execução com os valores calculados
        await companyFinancialClosingExecutionsRepository.update(companyExecution.id, {
          chargeValue: company.amountToBeCharged,
          calculatedChargeValue: true,
          invoiceEmissionType: company.data.typeEmissionNF,
        });

        // Atualizar o objeto local
        companyExecution.chargeValue = company.amountToBeCharged;
        companyExecution.calculatedChargeValue = true;
        companyExecution.invoiceEmissionType = company.data.typeEmissionNF;

        await this.messageQueueService.add<CompanyFinancialClosingJobData>(
          RunCompanyFinancialClosingJobProcessor.name,
          {
            financialClosing,
            workspaceId,
            company: company.data,
            amountToBeCharged: company.amountToBeCharged,
            billingModel: company.billingModel,
            executionLog: newExecutionLog,
            companyExecutionLog: companyExecution,
          },
          // { attempts: 3, removeOnComplete: true }
        );

        // Marco de finalização da emissão de boletos e notas fiscais
        await financialClosingExecutionsRepository.update(newExecutionLog.id, {
          completedBoletoIssuance: true,
          completedInvoiceIssuance: true,
        });
      }

      await financialClosingExecutionsRepository.update(newExecutionLog.id, {
        status: FinancialClosingExecutionStatusEnum.SUCCESS,
      });

    } catch (error) {

      await addFinancialClosingExecutionLog(
        newExecutionLog,
        financialClosingExecutionsRepository,
        'error',
        `Erro fatal na execução do fechamento: ${error.message}`,
        {
          status: FinancialClosingExecutionStatusEnum.ERROR,
        }
      );
    }
  }
}
