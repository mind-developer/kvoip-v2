import { Injectable } from '@nestjs/common';

import { FinancialClosing } from './financial-closing.entity';

import { Logger } from '@nestjs/common';
import { InterCustomerType } from 'src/engine/core-modules/inter/interfaces/charge.interface';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';
import { ChargeAction, ChargeEntityType, ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

@Injectable()
export class FinancialClosingChargeService {
  private readonly logger = new Logger(FinancialClosingChargeService.name);

  constructor(
    
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly interApiService: InterApiService,
  ) {}

  // Função publica generica para validação de campos obrigatórios
  public validateRequiredFields(company: CompanyWorkspaceEntity): void {
    
    // Campos obrigatórios do objeto CompanyWorkspaceEntity
    const requiredFields = [
      'cpfCnpj', 
      'name', 
      'address', 
      'address.addressNumber', 
      'address.addressStreet1', 
      'address.addressCity', 
      'address.addressState', 
      'address.addressPostcode', 
      'emails.primaryEmail'
    ];

    const getNestedValue = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const getFieldLabel = (fieldPath: string): string => {
      // Para campos simples (sem ponto)
      if (!fieldPath.includes('.')) {
        const fieldMetadata = metadataArgsStorage
          .filterFields(CompanyWorkspaceEntity)
          .find(field => field.name === fieldPath);
        const label = fieldMetadata?.label;
        return typeof label === 'string' ? label : fieldPath;
      }

      // Para campos aninhados (com ponto)
      const [parentField, childField] = fieldPath.split('.');
      
      // Busca o campo pai na entidade
      const parentFieldMetadata = metadataArgsStorage
        .filterFields(CompanyWorkspaceEntity)
        .find(field => field.name === parentField);
      
      if (!parentFieldMetadata) {
        return fieldPath;
      }

      // Para campos de endereço
      if (parentField === 'address') {
        const addressLabels: Record<string, string> = {
          'addressNumber': 'Número',
          'addressStreet1': 'Rua',
          'addressStreet2': 'Complemento',
          'addressCity': 'Cidade',
          'addressState': 'Estado',
          'addressPostcode': 'CEP'
        };
        return `${addressLabels[childField] || childField}`;
      }

      // Para campos de email
      if (parentField === 'emails') {
        const emailLabels: Record<string, string> = {
          'primaryEmail': 'Email'
        };
        return `${emailLabels[childField] || childField}`;
      }

      return `${childField}`;
    };

    const missingFields = requiredFields.filter(field => !getNestedValue(company, field));

    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields.map(field => getFieldLabel(field));
      throw new Error(`Company is missing required fields: ${missingFieldLabels.join(', ')}`);
    }
  }

  public validateCep(cep: string): void {
    if (cep.replace(/\D/g, '').length !== 8) {
      throw new Error('O campo CEP da empresa está incorreto, deve possuir 8 números e de preferência sem caracteres especiais');
    }
  }

  private removeSpecialCharacters(str: any): string {
    return str.replace(/\D/g, '');
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