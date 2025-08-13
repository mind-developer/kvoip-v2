import { BadRequestException } from '@nestjs/common';
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


export class FinancialClosingChargeService {
  private readonly logger = new Logger(FinancialClosingChargeService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly interApiService: InterApiService,
  ) {}

  async test(): Promise<void> {
    this.logger.log(`SERVICE INTERNO EXECUTADO`);
  }

  // async emitChargeForCompany(
  //   workspaceId: string,
  //   company: CompanyWorkspaceEntity, 
  //   amountToBeCharged: number,
  //   financialClosing?: FinancialClosing, 
  // ): Promise<{ requestCode: string }> {
    
  //   if (!true) {
  //     // Inserir aqui qualquer validação de company
  //   }

  //   const attachmentRepository =
  //     await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
  //       workspaceId,
  //       'attachment',
  //       { shouldBypassPermissionChecks: true },
  //     );

  //   const client = {
  //     nome: company.name || '',
  //     cpfCnpj: company.cpfCnpj || '',
  //     tipoPessoa: chargeEntityTypeToInterCustomerTypeMap(company.entityType),
  //     endereco: company.address?.addressStreet1 || 'Rua ...',
  //     // telefone: company.phone || '',
  //     telefone: '',
  //     cep: company.address?.addressZipCode || '00000000',
  //     cidade: company.address?.addressCity || '',
  //     uf: company.address?.addressState || 'SP',
  //     // ddd: company.phone?.replace(/^\+/, '') || '',
  //     ddd: '',
  //     bairro: company.address?.addressStreet1 || '',
  //     // email: company.emails?.primaryEmail || '',
  //     email: '',
  //     complemento: '-',
  //     numero: '-',
  //   };

  //   const numberCharge = `${company.id.slice(0, 8)}-${Date.now()}`;

  //   const getSlipDueDay = (): string => {
  //     if (company.slipDueDay) {
  //       const today = new Date();
  //       let year = today.getFullYear();
  //       let month = today.getMonth(); // 0-11

  //       // Se o dia do vencimento já passou no mês atual, joga para o próximo mês
  //       if (today.getDate() > company.slipDueDay) {
  //         month++;
  //         if (month > 11) {
  //           month = 0;
  //           year++;
  //         }
  //       }

  //       // Monta a data
  //       const dueDate = new Date(year, month, company.slipDueDay);
  //       return dueDate.toISOString().split('T')[0]; // YYYY-MM-DD
  //     }

  //     // Caso não tenha slipDueDay, adiciona +10 dias a partir de hoje
  //     const date = new Date();
  //     date.setDate(date.getDate() + 10);
  //     return date.toISOString().split('T')[0];
  //   };

  //   try {
  //     const response =
  //       await this.interApiService.issueChargeAndStoreAttachment(
  //         workspaceId,
  //         attachmentRepository,
  //         {
  //           id: company.id,
  //           authorId: company.id,
  //           seuNumero: numberCharge,
  //           valorNominal: amountToBeCharged,
  //           dataVencimento: getSlipDueDay(),
  //           numDiasAgenda: 60,
  //           pagador: { ...client },
  //           mensagem: { linha1: '-' },
  //         },
  //       );

  //     this.logger.log(
  //       `Cobrança emitida para empresa ${company.name} (Cód: ${response.codigoSolicitacao})`,
  //     );

  //     return { requestCode: response.codigoSolicitacao };

  //   } catch (err) {
  //     // TODO: realizar o informe e atualizar logs para ser possivel repetir novamente
  //     this.logger.error(
  //       `Erro ao emitir cobrança para empresa ${company.name}: ${err.message}`,
  //       err.stack,
  //     );
  //     throw err;
  //   }
  // }

  


  // =============================================================================|
  // Private methods                                                              |
  // =============================================================================|

  // private getJobId(id: string): string {
  //   return `${RunFinancialClosingJobProcessor.name}::${id}`;
  // }
}









