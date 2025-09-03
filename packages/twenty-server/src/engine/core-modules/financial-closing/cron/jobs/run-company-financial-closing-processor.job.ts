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
    
    try {
      companyFinancialClosingExecutionsRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
          data.workspaceId,
          'companyFinancialClosingExecution',
          { shouldBypassPermissionChecks: true },
        );

      this.logger.log(
        `🏦 🏦 🏦 🏦 🏦 🏦 2 Processing company for financial closing ${data.financialClosing.id} in workspace ${data.workspaceId}`
      );

      // Tentativa de emissão de cobrança
      let charge;
      try {
        charge = await this.financialClosingChargeService.emitChargeForCompany(
          data.workspaceId,
          data.company,
          data.amountToBeCharged,
          data.financialClosing,
        );
      } catch (chargeError) {
        const errorMessage = `Falha na emissão de cobrança: ${chargeError.message}`;
        await addCompanyFinancialClosingExecutionErrorLog(
          data.companyExecutionLog,
          companyFinancialClosingExecutionsRepository,
          errorMessage,
          data.company
        );
        throw chargeError;
      }

      // Atualização do log de execução se a cobrança foi bem-sucedida
      if (charge) {
        // try {
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

        // } catch (updateError) {

        //   const errorMessage = `Falha na atualização do log de execução: ${updateError.message}`;
        //   await addCompanyFinancialClosingExecutionErrorLog(
        //     data.companyExecutionLog,
        //     companyFinancialClosingExecutionsRepository,
        //     errorMessage,
        //     data.company
        //   );
        //   throw updateError;
        // }
      } else {
        await addCompanyFinancialClosingExecutionErrorLog(
          data.companyExecutionLog,
          companyFinancialClosingExecutionsRepository,
          'Cobrança não foi gerada - retorno nulo do serviço',
          data.company
        );
      }
    } catch (error) {
      // Log de erro geral se o repositório estiver disponível
      if (companyFinancialClosingExecutionsRepository && data.companyExecutionLog) {
        const errorMessage = `Erro geral no processamento do fechamento financeiro: ${error.message}`;
        await addCompanyFinancialClosingExecutionErrorLog(
          data.companyExecutionLog,
          companyFinancialClosingExecutionsRepository,
          errorMessage,
          data.company
        );
      }
      
      this.logger.error(
        `Erro no processamento da empresa ${data.company?.name} (${data.company?.id}): ${error.message}`,
        error.stack
      );
      
      throw error;
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

