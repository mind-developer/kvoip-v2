import { Logger, Scope } from '@nestjs/common';
import { TypeEmissionNFEnum } from 'src/engine/core-modules/financial-closing/constants/type-emission-nf.constants';
import { CompanyFinancialClosingJobData } from 'src/engine/core-modules/financial-closing/cron/jobs/run-financial-closing-processor.job';
import { FinancialClosingChargeService } from 'src/engine/core-modules/financial-closing/financial-closing-charge.service';
import { FinancialClosingNFService } from 'src/engine/core-modules/financial-closing/financial-closing-focusnf.service';
import { addCompanyFinancialClosingExecutionErrorLog, addCompanyFinancialClosingExecutionLog } from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { FinancialClosingExecutionStatusEnum } from 'src/modules/financial-closing-execution/constants/financial-closing-execution-status.constants';
import { FinancialClosingExecutionWorkspaceEntity } from 'src/modules/financial-closing-execution/standard-objects/financial-closing-execution.workspace-entity';
import { addFinancialClosingExecutionLog } from 'src/modules/financial-closing-execution/utils/financial-closing-execution-utils';

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.DEFAULT,
})
export class RunCompanyFinancialClosingJobProcessor {
  private readonly logger = new Logger(RunCompanyFinancialClosingJobProcessor.name);

  constructor(
    private readonly financialClosingChargeService: FinancialClosingChargeService,
    private readonly financialClosingNFService: FinancialClosingNFService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager, // precisa injetar aqui
  ) {}

  @Process(RunCompanyFinancialClosingJobProcessor.name)
  async handle(data: CompanyFinancialClosingJobData): Promise<void> {
    let companyFinancialClosingExecutionsRepository: any;
    let financialClosingExecutionsRepository: any;
    
    try {
      companyFinancialClosingExecutionsRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
          data.workspaceId,
          'companyFinancialClosingExecution',
          { shouldBypassPermissionChecks: true },
        );

      financialClosingExecutionsRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<FinancialClosingExecutionWorkspaceEntity>(
          data.workspaceId,
          'financialClosingExecution',
          { shouldBypassPermissionChecks: true },
        );

      this.financialClosingChargeService.validateRequiredFields(data.company);

      // Tentativa de emissão de cobrança
      const charge = await this.financialClosingChargeService.emitChargeForCompany(
        data.workspaceId,
        data.company,
        data.amountToBeCharged,
        data.financialClosing,
      );

      // Atualização do log de execução se a cobrança foi bem-sucedida
      if (charge) {
        
        await companyFinancialClosingExecutionsRepository.update(data.companyExecutionLog.id, {
          chargeId: charge.id,
          completedBoletoIssuance: true,
          status: FinancialClosingExecutionStatusEnum.SUCCESS,
        });
        
        // Log de sucesso
          const successMessage = `Cobrança emitida com sucesso. Charge ID: ${charge.id}`;
          await addCompanyFinancialClosingExecutionLog(
            data.companyExecutionLog,
            companyFinancialClosingExecutionsRepository,
            successMessage,
            'info',
            FinancialClosingExecutionStatusEnum.SUCCESS,
            data.company
          );

      } else {
        throw new Error('Cobrança não foi gerada - retorno nulo do serviço de emissão de cobrança');
      }

    } catch (error) {

      // Adicionando logs de erro e status na execução da empresa
      if (companyFinancialClosingExecutionsRepository && data.companyExecutionLog) {
        await addCompanyFinancialClosingExecutionErrorLog(
          data.companyExecutionLog,
          companyFinancialClosingExecutionsRepository,
          '333333333333333333333333333333333333333 Não foi possivel gerar cobrança: ' + error.message,
          data.company,
          { status: FinancialClosingExecutionStatusEnum.ERROR }
        );
      }

      // Adicionando logs de erro e status na execução do fechamento financeiro
      if (financialClosingExecutionsRepository && data.executionLog) {

        await financialClosingExecutionsRepository.increment(
          { id: data.executionLog.id },
          'companiesWithError',
          1
        );

        await addFinancialClosingExecutionLog(
          data.executionLog,
          financialClosingExecutionsRepository,
          'warn',
          `Erro para gerar cobrança para a empresa ${data.company.name} (${data.company.id})`,
        );
      }
      
      return;
    }

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

