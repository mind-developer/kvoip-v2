/* eslint-disable @nx/workspace-rest-api-methods-should-be-guarded */
import { msg } from '@lingui/core/macro';
import { Body, Controller, Logger, Param, Post } from '@nestjs/common';

import { FinancialClosingNFService } from 'src/engine/core-modules/financial-closing/financial-closing-focusnf.service';
import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
import { FinancialClosingService } from 'src/engine/core-modules/financial-closing/financial-closing.service';
import { addCompanyFinancialClosingExecutionLog } from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { Repository } from 'typeorm';

@Controller('inter-integration')
export class InterIntegrationWebhookController {
  private readonly logger = new Logger(InterIntegrationWebhookController.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly financialClosingNFService: FinancialClosingNFService,
    private readonly financialClosingService: FinancialClosingService,
  ) {}

  @Post('/webhook/:workspaceId/:integrationId')
  async handleWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('integrationId') integrationId: string,
    @Body() body: any | any[],
  ) {
    this.logger.log(`[${integrationId}] Webhook recebido do Banco Inter`);
    this.logger.log(`Webhook body: ${JSON.stringify(body, null, 2)}`);
    this.logger.log(`Webhook body Situação: ${body[0]?.situacao}`);

    // Verifica se o body é um array e se nao for verifica se existe o campo situacao
    if (!Array.isArray(body)) {
      if (!body?.situacao) {
        this.logger.error(
          `Webhook recebido não é um array e não possui o campo situacao`,
        );
        return;
      }
      body = [body];
    }

    body.forEach(async (item: any) => {
      try {
        if (item?.situacao == 'RECEBIDO') {
          this.logger.log(
            `[${integrationId}] Pagamento confirmado detectado - processando...`,
          );
          await this.processPaymentConfirmed(workspaceId, item);
        } else {
          // TODO: Implementar situação de expirado aqui ---------|

          const situacao = item?.situacao || 'Desconhecida';
          this.logger.log(
            `[${integrationId}] Webhook ignorado - situação: ${situacao}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `[${integrationId}] Erro ao processar webhook:`,
          error,
        );
      }
    });
  }

  private async processPaymentConfirmed(
    workspaceId: string,
    webhookData: any,
  ): Promise<void> {
    const codigoSolicitacao =
      webhookData.codigoSolicitacao || webhookData.seuNumero;

    if (!codigoSolicitacao) {
      this.logger.error('Código de solicitação não encontrado no webhook');
      return;
    }

    this.logger.log(
      `Processando pagamento: ${codigoSolicitacao} - Valor: ${webhookData.valorTotalRecebido} - Origem: ${webhookData.origemRecebimento}`,
    );

    // Buscar dados necessários
    const { charge, companyExecution, financialClosing } =
      await this.findPaymentData(workspaceId, codigoSolicitacao);

    if (!charge || !companyExecution || !financialClosing) {
      return; // Erros já logados na função findPaymentData
    }

    // Emitir nota fiscal se configurado para APÓS pagamento
    if (companyExecution.company?.typeEmissionNF === 'AFTER') {
      await this.emitInvoiceAfterPayment(
        workspaceId,
        charge,
        companyExecution,
        financialClosing,
      );
    } else {
      this.logger.log(
        `Empresa ${companyExecution.company?.name} não possui emissão de NF configurada para APÓS pagamento`,
      );
    }
  }

  private async findPaymentData(
    workspaceId: string,
    codigoSolicitacao: string,
  ) {
    // Buscar charge
    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
        { shouldBypassPermissionChecks: true },
      );

    const charge = await chargeRepository.findOne({
      where: { requestCode: codigoSolicitacao },
      relations: ['company'],
    });

    if (!charge) {
      this.logger.error(
        `Charge não encontrada para código: ${codigoSolicitacao}`,
      );
      return { charge: null, companyExecution: null, financialClosing: null };
    }

    this.logger.log(
      `Charge encontrada: ${charge.id} - Empresa: ${charge.company?.name}`,
    );

    // Buscar execução da empresa
    const companyExecutionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
        workspaceId,
        'companyFinancialClosingExecution',
        { shouldBypassPermissionChecks: true },
      );

    const companyExecution = await companyExecutionRepository.findOne({
      where: { chargeId: charge.id },
      relations: ['company', 'financialClosingExecution'],
    });

    if (!companyExecution) {
      this.logger.error(`Execução não encontrada para charge: ${charge.id}`);
      return { charge, companyExecution: null, financialClosing: null };
    }

    // Buscar financial closing
    const financialClosing = await this.financialClosingService.findById(
      companyExecution.financialClosingExecution?.financialClosingId!,
    );

    // const financialClosingRepository = await this.twentyORMGlobalManager.getRepositoryForWorkspace<FinancialClosing>(
    //   workspaceId,
    //   'financialClosing',
    //   { shouldBypassPermissionChecks: true },
    // );

    // const financialClosing = await financialClosingRepository.findOne({
    //   where: { id: companyExecution.financialClosingExecution?.financialClosingId },
    // });

    if (!financialClosing) {
      this.logger.error(
        `FinancialClosing não encontrado para ID: ${companyExecution.financialClosingExecution?.financialClosingId}`,
      );
      return { charge, companyExecution, financialClosing: null };
    }

    return { charge, companyExecution, financialClosing };
  }

  private async emitInvoiceAfterPayment(
    workspaceId: string,
    charge: ChargeWorkspaceEntity,
    companyExecution: CompanyFinancialClosingExecutionWorkspaceEntity,
    financialClosing: FinancialClosing,
  ): Promise<void> {
    if (!companyExecution.company) {
      this.logger.error('Empresa não encontrada na execução');
      return;
    }

    try {
      this.logger.log(
        `Emitindo nota fiscal para empresa ${companyExecution.company.name} após pagamento confirmado`,
      );

      const companyExecutionRepository =
        (await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
          workspaceId,
          'companyFinancialClosingExecution',
          { shouldBypassPermissionChecks: true },
        )) as Repository<CompanyFinancialClosingExecutionWorkspaceEntity>;

      // Emitir nota fiscal
      await this.financialClosingNFService.emitNFForCompany(
        workspaceId,
        companyExecution.company,
        charge,
        financialClosing,
        companyExecution,
        companyExecutionRepository,
      );

      // Atualizar execução
      await companyExecutionRepository.update(companyExecution.id, {
        completedInvoiceIssuance: true,
      });

      // Log de sucesso
      await addCompanyFinancialClosingExecutionLog(
        companyExecution,
        companyExecutionRepository,
        msg`Invoice issued successfully after payment confirmation via webhook inter`.toString(),
        'info',
      );

      this.logger.log(
        `Nota fiscal emitida com sucesso para empresa ${companyExecution.company.name}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao emitir nota fiscal para empresa ${companyExecution.company.name}:`,
        error,
      );
      throw error;
    }
  }
}
