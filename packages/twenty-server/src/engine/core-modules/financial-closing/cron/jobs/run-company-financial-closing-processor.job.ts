import { msg } from '@lingui/core/macro';
import { Logger, Scope } from '@nestjs/common';
import { TypeEmissionNFEnum } from 'src/engine/core-modules/financial-closing/constants/type-emission-nf.constants';
import { CompanyFinancialClosingJobData } from 'src/engine/core-modules/financial-closing/cron/jobs/run-financial-closing-processor.job';
import { FinancialClosingChargeService } from 'src/engine/core-modules/financial-closing/financial-closing-charge.service';
import { FinancialClosingNFService } from 'src/engine/core-modules/financial-closing/financial-closing-focusnf.service';
import {
  addCompanyFinancialClosingExecutionErrorLog,
  addCompanyFinancialClosingExecutionLog,
} from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { FinancialClosingExecutionStatusEnum } from 'src/modules/financial-closing-execution/constants/financial-closing-execution-status.constants';
import { FinancialClosingExecutionWorkspaceEntity } from 'src/modules/financial-closing-execution/standard-objects/financial-closing-execution.workspace-entity';
import { addFinancialClosingExecutionLog } from 'src/modules/financial-closing-execution/utils/financial-closing-execution-utils';
import { Repository } from 'typeorm';

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.DEFAULT,
})
export class RunCompanyFinancialClosingJobProcessor {
  private readonly logger = new Logger(
    RunCompanyFinancialClosingJobProcessor.name,
  );

  constructor(
    private readonly financialClosingChargeService: FinancialClosingChargeService,
    private readonly financialClosingNFService: FinancialClosingNFService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager, // precisa injetar aqui
  ) {}

  @Process(RunCompanyFinancialClosingJobProcessor.name)
  async handle(data: CompanyFinancialClosingJobData): Promise<void> {
    let companyFinancialClosingExecutionsRepository:
      | Repository<CompanyFinancialClosingExecutionWorkspaceEntity>
      | undefined;
    let financialClosingExecutionsRepository:
      | Repository<FinancialClosingExecutionWorkspaceEntity>
      | undefined;
    let charge: any = null;

    try {
      companyFinancialClosingExecutionsRepository =
        (await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
          data.workspaceId,
          'companyFinancialClosingExecution',
          { shouldBypassPermissionChecks: true },
        )) as Repository<CompanyFinancialClosingExecutionWorkspaceEntity>;

      financialClosingExecutionsRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<FinancialClosingExecutionWorkspaceEntity>(
          data.workspaceId,
          'financialClosingExecution',
          { shouldBypassPermissionChecks: true },
        );

      this.financialClosingChargeService.validateRequiredFields(data.company);
      this.financialClosingChargeService.validateCep(
        data.company.address.addressPostcode || '',
      );
      this.financialClosingChargeService.validateState(
        data.company.address.addressState,
      );

      // Tentativa de emissão de cobrança
      charge = await this.financialClosingChargeService.emitChargeForCompany(
        data.workspaceId,
        data.company,
        data.amountToBeCharged,
        data.financialClosing,
      );

      // Atualização do log de execução se a cobrança foi bem-sucedida
      if (charge) {
        await companyFinancialClosingExecutionsRepository.update(
          data.companyExecutionLog.id,
          {
            chargeId: charge.id,
            completedBoletoIssuance: true,
            // status: FinancialClosingExecutionStatusEnum.SUCCESS,
          },
        );

        // Log de sucesso
        const successMessage = msg`Charge issued successfully` + '. ' + msg`Charge ID` + ': ' + charge.id;
        await addCompanyFinancialClosingExecutionLog(
          data.companyExecutionLog,
          companyFinancialClosingExecutionsRepository,
          successMessage,
          'info',
          FinancialClosingExecutionStatusEnum.SUCCESS,
          data.company,
          { chargeId: charge.id },
        );
      } else {
        throw new Error(
          msg`Charge was not generated - null return from charge issuance service`.toString(),
        );
      }
    } catch (error) {
      // Tratamento específico para erros da API de cobrança
      let errorMessage = msg`It was not possible to generate the charge`.toString();

      // Tenta extrair o erro real do message se ele contém um JSON
      let actualError = error;
      if (
        error?.message &&
        typeof error.message === 'string' &&
        error.message.includes('Error: {')
      ) {
        try {
          // Extrai o JSON do final da mensagem
          const jsonMatch = error.message.match(/Error: (\{[\s\S]*\})$/);
          if (jsonMatch) {
            actualError = JSON.parse(jsonMatch[1]);
          }
        } catch (parseError) {
          // Se não conseguir fazer parse, usa o erro original
        }
      }

      if (
        actualError?.response?.data?.violacoes &&
        Array.isArray(actualError.response.data.violacoes)
      ) {
        // Erro da API de cobrança com violações específicas
        const violacoes = actualError.response.data.violacoes;
        const violacoesText = violacoes
          .map((v: any) => `${v.propriedade}: ${v.razao} (valor: "${v.valor}")`)
          .join('; ');
        errorMessage = msg`Error in charge data validation` + ': ' + violacoesText;
      } else if (actualError?.response?.data?.detail) {
        // Erro da API de cobrança com detalhe genérico
        errorMessage = msg`Error in charge API` + ': ' + actualError.response.data.detail;
      } else if (
        actualError?.data?.violacoes &&
        Array.isArray(actualError.data.violacoes)
      ) {
        // Erro direto com violações (sem response)
        const violacoes = actualError.data.violacoes;
        const violacoesText = violacoes
          .map(
            (v: any) =>
              `${v.propriedade}: ${v.razao} (valor enviado: "${v.valor}")`,
          )
          .join('; ');
        errorMessage = msg`Error in charge data validation` + ': ' + violacoesText;
      } else if (actualError?.data?.detail) {
        // Erro direto com detalhe (sem response)
        errorMessage = msg`Error in charge API` + ': ' + actualError.data.detail;
      } else if (error?.message) {
        // Erro genérico
        errorMessage = msg`Error to generate charge` + ': ' + error.message;
      }

      // Adicionando logs de erro e status na execução da empresa
      if (
        companyFinancialClosingExecutionsRepository &&
        data.companyExecutionLog
      ) {
        await addCompanyFinancialClosingExecutionErrorLog(
          data.companyExecutionLog,
          companyFinancialClosingExecutionsRepository,
          errorMessage!,
          data.company,
          { status: FinancialClosingExecutionStatusEnum.ERROR },
        );
      }

      // Adicionando logs de erro e status na execução do fechamento financeiro
      if (financialClosingExecutionsRepository && data.executionLog) {
        await financialClosingExecutionsRepository.increment(
          { id: data.executionLog.id },
          'companiesWithError',
          1,
        );

        await addFinancialClosingExecutionLog(
          data.executionLog,
          financialClosingExecutionsRepository,
          'warn',
          msg`Error to generate charge for the company` + ' ' + data.company.name + ' (' + data.company.id + ')',
        );
      }

      return;
    }

    // Inicio da emissão de nota fiscal ----------------------------------------------------------------------|

    if (data.company.typeEmissionNF == TypeEmissionNFEnum.BEFORE) {
      try {
        await this.financialClosingNFService.emitNFForCompany(
          data.workspaceId,
          data.company,
          charge,
          data.financialClosing,
          data.companyExecutionLog,
          companyFinancialClosingExecutionsRepository,
        );

        if (financialClosingExecutionsRepository && data.executionLog) {
          await companyFinancialClosingExecutionsRepository.update(
            data.companyExecutionLog.id,
            {
              completedInvoiceIssuance: true,
            },
          );
        }
      } catch (error) {
        if (
          companyFinancialClosingExecutionsRepository &&
          data.companyExecutionLog
        ) {
          await addCompanyFinancialClosingExecutionErrorLog(
            data.companyExecutionLog,
            companyFinancialClosingExecutionsRepository,
            msg`Error to emit invoice` + ' ' + error.message,
            data.company,
            { status: FinancialClosingExecutionStatusEnum.ERROR },
          );
        }

        // Adicionando logs de erro e status na execução do fechamento financeiro
        if (financialClosingExecutionsRepository && data.executionLog) {
          await financialClosingExecutionsRepository.increment(
            { id: data.executionLog.id },
            'companiesWithError',
            1,
          );

          await addFinancialClosingExecutionLog(
            data.executionLog,
            financialClosingExecutionsRepository,
            'warn',
            msg`Error to emit invoice for the company` + ' ' + data.company.name + ' (' + data.company.id + ')',
          );
        }

        this.logger.error(
          `ERRO TRY CATCH EMISSAO DA NOTA FISCAL ${data.company.name} (${data.company.id}): ${error.message}`,
        );
        return;
      }
    } else {
      let message = '';
      if (data.company.typeEmissionNF == TypeEmissionNFEnum.AFTER) {
        message = msg`Invoice configured to be issued after payment, not issued`.toString();
      } else {
        message = msg`The company does not have invoice emission configured, not issued`.toString();
      }

      if (financialClosingExecutionsRepository && data.executionLog) {
        await addCompanyFinancialClosingExecutionLog(
          data.companyExecutionLog,
          companyFinancialClosingExecutionsRepository,
          message,
          'warn',
        );
      }
    }
  }
}
