import { Injectable, Logger } from '@nestjs/common';
import { InterCustomerType } from 'src/engine/core-modules/inter/interfaces/charge.interface';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
// import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';
import { ChargeAction, ChargeEntityType, ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FinancialClosing } from './financial-closing.entity';
import { CompanyValidationUtils } from './utils/company-validation.utils';
import { PaymentService } from 'src/engine/core-modules/payment/services/payment.service';
import { PaymentProvider } from 'src/engine/core-modules/payment/enums/payment-provider.enum';
import { PaymentMethod } from 'src/engine/core-modules/payment/enums/payment-method.enum';
import { addDays } from 'date-fns';

@Injectable()
export class FinancialClosingChargeService {
  private readonly logger = new Logger(FinancialClosingChargeService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    // private readonly interApiService: InterApiService,
    private readonly paymentService: PaymentService
  ) {}

  // Função publica generica para validação de campos obrigatórios
  public validateRequiredFields(company: CompanyWorkspaceEntity): void {
    CompanyValidationUtils.validateRequiredFields(company);
  }

  public validateCep(cep: string): void {
    CompanyValidationUtils.validateCep(cep);
  }

  private removeSpecialCharacters(str: any): string {
    return str.replace(/\D/g, '');
  }

  public validateState(state: string): void {
    CompanyValidationUtils.validateState(state);
  }

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
      cpfCnpj: this.removeSpecialCharacters(company.cpfCnpj),
      tipoPessoa: this.getTipoPessoa(company.cpfCnpj || ''),
      endereco: company.address?.addressStreet1,
      telefone: '',
      cep: this.removeSpecialCharacters(company.address?.addressPostcode),
      cidade: company.address?.addressCity,
      uf: company.address?.addressState || 'SP',
      ddd: '',
      bairro: company.address?.addressStreet2,
      email: company.emails.primaryEmail,
      complemento: '',
      numero: company.address?.addressNumber,
    };

    const numberCharge = `${company.id.replace(/\d/g, '').slice(0, 2)}${Date.now()}`.slice(0, 15);

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
      // const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

      // let charge = chargeRepository.create({
      //   name: `Fechamento Automático - ${financialClosing.name} - ${today} - ${company.name}`,
      //   price: amountToBeCharged,
      //   quantity: 1,
      //   entityType: company.cpfCnpj?.replace(/\D/g, '').length === 11 
      //     ? ChargeEntityType.INDIVIDUAL
      //     : ChargeEntityType.COMPANY,
      //   chargeAction: ChargeAction.ISSUE,
      //   company: company,
      // });

      // charge = await chargeRepository.save(charge);

      // // 2. Emitir cobrança na API do Inter

      // const response =
      //   await this.interApiService.issueChargeAndStoreAttachment(
      //     workspaceId,
      //     attachmentRepository,
      //     {
      //       id: charge.id,
      //       authorId: company.id,
      //       seuNumero: numberCharge,
      //       valorNominal: amountToBeCharged,
      //       dataVencimento: getSlipDueDay(),
      //       numDiasAgenda: 60, // Número de dias corridos após o vencimento para o cancelamento efetivo automático da cobrança. (de 0 até 60)
      //       pagador: { ...client },
      //       mensagem: { linha1: '-' },
      //     },
      //   );

      // // 3. Atualizar objeto charge com requestCode oficial da API (se diferente)
      // charge.requestCode = response.codigoSolicitacao;
      // await chargeRepository.save(charge);

      // this.logger.log(
      //   `Cobrança emitida para a empresa` + ' ' + company.name + ' (Code: ' + response.codigoSolicitacao + ')',
      // );

      // return charge;


      const payerInfo = {
        name: company.name,
        email: company.emails.primaryEmail,
        taxId: company.cpfCnpj!,
        address: {
          city: company.address.addressCity,
          state: company.address.addressState,
          zipCode: company.address.addressPostcode,
          street: company.address.addressStreet1,
        }, 
      }

      const chargeObj = {
        workspaceId: workspaceId,
        paymentMethod: PaymentMethod.BOLEPIX,
        amount: amountToBeCharged,
        payerInfo: payerInfo,
        description: 'Teste',
        // dueDate: getSlipDueDay,
        dueDate: addDays(new Date(Date.now()), 10), 
        // metadata: {

        // }
      }

      this.logger.log(`Creating charge for company ${company.name} with amount ${amountToBeCharged}`);
      this.logger.log(`Charge object -------------------------------------------------: ${JSON.stringify(chargeObj, null, 2)}`);

      const charge = await this.paymentService.createCharge({
        workspaceId: workspaceId,
        chargeDto: chargeObj,
        provider: PaymentProvider.INTER, 
        // integrationId: 'teste', // Refazer isso
      });

      // const { charge: updatedCharge } = await this.paymentService.getBankSlipFile({
      //   workspaceId: workspaceId,
      //   chargeId: charge.id,
      //   provider: PaymentProvider.INTER,
      // });

      // return updatedCharge;
      return charge;

    } catch (err) {
      // this.logger.error(
      //   `Erro ao emitir a cobrança para a empresa` + ' ' + company.name + ': ' + err.message,
      //   err.stack,
      // );
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