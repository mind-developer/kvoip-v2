import { Injectable, Logger } from '@nestjs/common';
import { addCompanyFinancialClosingExecutionLog } from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';
import { FocusNFeWorkspaceEntity } from 'src/modules/focus-nfe/standard-objects/focus-nfe.workspace-entity';
import { NfStatus } from 'src/modules/focus-nfe/types/NfStatus';
import { getNfTypeLabel, NfType } from 'src/modules/focus-nfe/types/NfType';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';
import { ProductTypeStatus, ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { Repository } from 'typeorm';
import {
    BRAZILIAN_STATES,
    CfopCommunicationEnum,
    CstIcmsCsosnEnum,
    ISS_RATES,
    NF_TEXTS,
    NfComClassificationEnum,
    normalizeState,
    ServiceListItemEnum,
    UNIT_VALUES,
    UnitOfMeasureEnum,
} from './constants/nf-constants';
import { FinancialClosing } from './financial-closing.entity';
import { CompanyValidationUtils } from './utils/company-validation.utils';
import { msg } from '@lingui/core/macro';

@Injectable()
export class FinancialClosingNFService {
  private readonly logger = new Logger(FinancialClosingNFService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly focusNFeService: FocusNFeService,
  ) {}

  async emitNFForCompany(
    workspaceId: string,
    company: CompanyWorkspaceEntity, 
    charge: ChargeWorkspaceEntity,
    financialClosing: FinancialClosing, 
    companyExecutionLog?: CompanyFinancialClosingExecutionWorkspaceEntity,
    companyFinancialClosingExecutionsRepository?: Repository<CompanyFinancialClosingExecutionWorkspaceEntity>,
  ): Promise<any> {

    this.logger.log(`TESTE CAIU NA EMISSAO DA NOTA FISCAL - ${company.name}`)
    
    // Validar campos obrigatórios da empresa
    CompanyValidationUtils.validateRequiredFields(company);
    
    // Validar percentuais de NF
    CompanyValidationUtils.validateNfPercentages(company);

    // Valida se o UF esta dentro das constantes

    CompanyValidationUtils.validateState(company.address.addressState);
    
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    // TODO: Verificar se a empresa possui integração com a focus
    const focusNFeList = await focusNFeRepository.find({
        take: 1,
      });

    const focusNFe = focusNFeList[0];

    this.logger.log(`focusNFe: ${JSON.stringify(focusNFe, null, 2)}`);

    if (!focusNFe) {
      throw new Error(`Não foi encontrada integração com a Focus NFe`);
    }

    const invoiceRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<InvoiceWorkspaceEntity>(
        workspaceId,
        'invoice',
        { shouldBypassPermissionChecks: true },
      );

    const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

    if (company.percentNfcom && company.percentNfcom > 0) {
      this.logger.log('CAIU NFCom');

      const cfop = this.getCfopForCommunication(
        focusNFe.state,               // estado do emissor
        company.address.addressState, // estado do cliente
      );

      let nfCom = invoiceRepository.create({
        name: `${getNfTypeLabel(NfType.NFCOM)} ${financialClosing.name} - ${today} - ${company.name}`,
        nfType: NfType.NFCOM, // Puxar da company
        nfStatus: NfStatus.DRAFT,
        issueDate: new Date().toISOString(),
        totalAmount: typeof charge.price === "number" 
          ? charge.price.toString() 
          : charge.price,
        percentNfcom: company.percentNfcom,
        cfop: cfop,
        cstIcmsCsosn: CstIcmsCsosnEnum.NORMAL_REGIME,
        unitOfMeasure: UnitOfMeasureEnum.UN,
        unit: UNIT_VALUES.DEFAULT,
        classification: NfComClassificationEnum.TELEPHONY_SERVICE,
        subscriberCode: company.id.substring(0, 30),
        numSubscriberAgreement: `${NfType.NFCOM}-${charge.id}`.substring(0, 15),

        companyFinancialClosingExecution: companyExecutionLog ?? null,
        companyFinancialClosingExecutionId: companyExecutionLog?.id ?? null,
        company: company,
        companyId: company.id,
        charge: charge,
        chargeId: charge.id,
        focusNFe: focusNFe,
        focusNFeId: focusNFe.id,
      });

      nfCom = await invoiceRepository.save(nfCom);

      nfCom.company = company;

      this.logger.log(`NOTA FISCAL CRIADA: ${JSON.stringify(nfCom, null, 2)}`);

      const fakeProductNfCom = {
        id: nfCom.id,
        name: NF_TEXTS.TELEPHONY_PLAN,
        productType: ProductTypeStatus.COMMODITY,
        unitOfMeasure: UnitOfMeasureEnum.UN,
        unit: UNIT_VALUES.SINGLE,
        classification: NfComClassificationEnum.TELEPHONY_SERVICE,
        cstIcmsCsosn: CstIcmsCsosnEnum.NORMAL_REGIME,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as ProductWorkspaceEntity;

      const issueResult = await this.focusNFeService.preIssueNf(
        nfCom,
        workspaceId,
        fakeProductNfCom,
      );

      if (issueResult && issueResult.success) {
        this.logger.log(
          `NOTA FISCAL EMITIDA: ${JSON.stringify(issueResult.data, null, 2)}`,
        );

        nfCom.companyFinancialClosingExecutionId = companyExecutionLog?.id ?? null;
        nfCom.nfStatus = NfStatus.IN_PROCESS; // Webhook atualiza para ISSUED assim que processado
        
        await invoiceRepository.update(nfCom.id, {
          companyFinancialClosingExecutionId: companyExecutionLog?.id ?? null
        });

        await invoiceRepository.save(nfCom);

        if (companyExecutionLog && companyFinancialClosingExecutionsRepository) {
          await addCompanyFinancialClosingExecutionLog(
            companyExecutionLog,
            companyFinancialClosingExecutionsRepository,
            `Solicitação de emissão de nota fiscal` + ' (' + getNfTypeLabel(NfType.NFCOM) + ')' + `emitida, aguardando processamento`,
            'info',
          );
        }

      } else {
        nfCom.nfStatus = NfStatus.CANCELLED;
        await invoiceRepository.save(nfCom);

        throw new Error(`(${getNfTypeLabel(NfType.NFCOM)}): ${issueResult?.error || 'Sem retorno'}`);
      }
    }

    if (company.percentNfse && company.percentNfse > 0) {

      this.logger.log('CAIU NFSE');

      let nfse = invoiceRepository.create({
        name: `${getNfTypeLabel(NfType.NFSE)} ${financialClosing.name} - ${today} - ${company.name}`,
        nfType: NfType.NFSE,
        nfStatus: NfStatus.DRAFT,
        issueDate: new Date().toISOString(),
        totalAmount:
          typeof charge.price === 'number'
            ? charge.price.toString()
            : charge.price,

        rateIss: ISS_RATES.DEFAULT,
        discrimination: NF_TEXTS.TELEPHONY_SERVICE,
        issRetained: false,
        serviceListItem: ServiceListItemEnum.TELEPHONY,
        percentNfse: company.percentNfse,

        companyFinancialClosingExecution: companyExecutionLog ?? null,
        companyFinancialClosingExecutionId: companyExecutionLog?.id ?? null,
        company: company,
        companyId: company.id,
        charge: charge,
        chargeId: charge.id,
        focusNFe: focusNFe,
        focusNFeId: focusNFe.id,
      });

      nfse = await invoiceRepository.save(nfse);

      nfse.company = company;

      this.logger.log(
        `NOTA FISCALL CRIADA nfse: ${JSON.stringify(nfse, null, 2)}`,
      );

      const fakeProductNfse = {
        id: nfse.id,
        name: NF_TEXTS.TELEPHONY_PLAN,
        issRetained: false,
        productType: ProductTypeStatus.SERVICE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as ProductWorkspaceEntity;

      const issueResult = await this.focusNFeService.preIssueNf(
        nfse,
        workspaceId,
        fakeProductNfse,
      );

      if (issueResult && issueResult.success) {
        this.logger.log(
          `NOTA FISCAL EMITIDA: ${JSON.stringify(issueResult.data, null, 2)}`,
        );
        
        nfse.companyFinancialClosingExecutionId = companyExecutionLog?.id ?? null;
        nfse.nfStatus = NfStatus.IN_PROCESS; // Webhook atualiza para ISSUED assim que processado

        await invoiceRepository.update(nfse.id, {
          companyFinancialClosingExecutionId: companyExecutionLog?.id ?? null
        });

        await invoiceRepository.save(nfse);

        if (companyExecutionLog && companyFinancialClosingExecutionsRepository) {
          await addCompanyFinancialClosingExecutionLog(
            companyExecutionLog,
            companyFinancialClosingExecutionsRepository,
            `Solicitação de emissão de nota fiscal` + ' (' + getNfTypeLabel(NfType.NFSE) + ')' + `emitida, aguardando processamento`,
            'info',
          );
        }

      } else {
        nfse.nfStatus = NfStatus.CANCELLED;
        await invoiceRepository.save(nfse);
          
        throw new Error(`(${getNfTypeLabel(NfType.NFSE)}): ${issueResult?.error || `Não foi possível emitir a nota fiscal`}`);
      }
    }

  }

  private getCfopForCommunication(
    emitterState: string,
    clientState: string,
  ): string {
    if (!emitterState) {
      throw new Error(
        `Estado do emissor é obrigatório para definir o CFOP. (Configure na integração com a FocusNFe)`,
      );
    }

    if (!clientState) {
      throw new Error(
        `Estado da empresa é obrigatório para definir o CFOP. (Configure na empresa)`,
      );
    }

    const normalizedEmitter = normalizeState(emitterState);
    const normalizedClient = normalizeState(clientState);

    // Exterior → não tem UF válida no Brasil
    const isClientExterior = !BRAZILIAN_STATES.includes(normalizedClient as any);

    if (isClientExterior) {
      return CfopCommunicationEnum.EXTERIOR;
    }

    if (normalizedEmitter === normalizedClient) {
      return CfopCommunicationEnum.INTRASTATE;
    }

    return CfopCommunicationEnum.INTERSTATE;
  }
}