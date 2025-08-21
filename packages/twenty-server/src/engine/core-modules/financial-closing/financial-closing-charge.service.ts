import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CreateFinancialClosingInput } from './dtos/create-financial-closing.input';
import { UpdateFinancialClosingInput } from './dtos/update-financial-closing.input';
import { FinancialClosing } from './financial-closing.entity';

import { Logger } from '@nestjs/common';
import { RunFinancialClosingJob, RunFinancialClosingJobProcessor } from 'src/engine/core-modules/financial-closing/cron/jobs/run-financial-closing-processor.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { getAmountToBeChargedToCompanies, getCompaniesForFinancialClosing } from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { chargeEntityTypeToInterCustomerTypeMap } from 'src/modules/charges/inter/utils/charge-entity-type-to-inter-cusotmer-type-map';
import { InterCustomerType } from 'src/engine/core-modules/inter/interfaces/charge.interface';
import { ChargeAction, ChargeEntityType, ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';

@Injectable()
export class FinancialClosingChargeService {
  private readonly logger = new Logger(FinancialClosingChargeService.name);

  constructor(
    
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly interApiService: InterApiService,
  ) {}

  async emitChargeForCompany(
    workspaceId: string,
    company: CompanyWorkspaceEntity, 
    amountToBeCharged: number,
    financialClosing: FinancialClosing, 
  ): Promise<ChargeWorkspaceEntity> {
    
    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
        { shouldBypassPermissionChecks: true },
      );

    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
        { shouldBypassPermissionChecks: true },
      );

    const client = {
      nome: company.name || '',
      cpfCnpj: company.cpfCnpj || '',
      tipoPessoa: this.getTipoPessoa(company.cpfCnpj || ''),
      endereco: company.address?.addressStreet1 || 'Rua ...',
      telefone: '',
      cep: company.address?.addressPostcode || '00000000',
      cidade: company.address?.addressCity || '',
      uf: company.address?.addressState || 'SP',
      ddd: '',
      bairro: company.address?.addressStreet1 || '',
      email: company.emails.primaryEmail || '',
      complemento: '-',
      numero: '-',
    };

    const numberCharge = `${company.id.replace(/\d/g, '').slice(0, 2)}${Date.now()}`.slice(0, 15);

    this.logger.log(`Número da cobrança: ${numberCharge}`);

    const getSlipDueDay = (): string => {
      if (company.slipDueDay) {
        const today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth();

        if (today.getDate() > company.slipDueDay) {
          month++;
          if (month > 11) {
            month = 0;
            year++;
          }
        }
        const dueDate = new Date(year, month, company.slipDueDay);
        return dueDate.toISOString().split('T')[0];
      }
      const date = new Date();
      date.setDate(date.getDate() + 10);
      return date.toISOString().split('T')[0];
    };

    try {     

      const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

      let charge = chargeRepository.create({
        name: `Fechamento Automático - ${financialClosing.name} - ${today} - ${company.name}`,
        price: amountToBeCharged,
        quantity: 1,
        // discount: 0,
        // requestCode: numberCharge,
        // recurrence: null,
        // taxId: company.cpfCnpj,
        entityType: company.cpfCnpj?.replace(/\D/g, '').length === 11 
          ? ChargeEntityType.INDIVIDUAL
          : ChargeEntityType.COMPANY,
        chargeAction: ChargeAction.ISSUE,
        company: company,
      });

      charge = await chargeRepository.save(charge);

      // this.logger.log(`Charge criada localmente: ${JSON.stringify(charge, null, 2)}`);

      // 2. Emitir cobrança na API do Inter
      const response =
        await this.interApiService.issueChargeAndStoreAttachment(
          workspaceId,
          attachmentRepository,
          {
            id: charge.id,
            authorId: company.id,
            seuNumero: numberCharge,
            valorNominal: amountToBeCharged,
            dataVencimento: getSlipDueDay(),
            numDiasAgenda: 60, // Número de dias corridos após o vencimento para o cancelamento efetivo automático da cobrança. (de 0 até 60)
            pagador: { ...client },
            mensagem: { linha1: '-' },
          },
        );

      // 3. Atualizar objeto charge com requestCode oficial da API (se diferente)
      charge.requestCode = response.codigoSolicitacao;
      await chargeRepository.save(charge);

      this.logger.log(
        `Cobrança emitida para empresa ${company.name} (Cód: ${response.codigoSolicitacao})`,
      );

      return charge;

    } catch (err) {
      this.logger.error(
        `Erro ao emitir cobrança para empresa ${company.name}: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }


  // =============================================================================|
  // Private methods                                                              |
  // =============================================================================|

  // private getJobId(id: string): string {
  //   return `${RunFinancialClosingJobProcessor.name}::${id}`;
  // }

  private getTipoPessoa(cpfCnpj: string): InterCustomerType.FISICA | InterCustomerType.JURIDICA {
    const onlyDigits = cpfCnpj.replace(/\D/g, '');
    return onlyDigits.length === 11 ? InterCustomerType.FISICA : InterCustomerType.JURIDICA;
  }
}