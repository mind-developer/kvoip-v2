import { BadRequestException, Injectable } from '@nestjs/common';
import { FinancialClosing } from './financial-closing.entity';
import { Logger } from '@nestjs/common';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import { getNfTypeLabel, NfType } from 'src/modules/focus-nfe/types/NfType';
import { FocusNFeWorkspaceEntity } from 'src/modules/focus-nfe/standard-objects/focus-nfe.workspace-entity';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';
import { ProductTypeStatus, ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { NfStatus } from 'src/modules/focus-nfe/types/NfStatus';

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
  ): Promise<any> {

    this.logger.log(`TESTE CAIU NA EMISSAO DA NOTA FISCAL - ${company.name}`)
    
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    const focusNFeList = await focusNFeRepository.find({
        take: 1,
      });

    const focusNFe = focusNFeList[0];

    this.logger.log(`focusNFe: ${JSON.stringify(focusNFe, null, 2)}`);

    if (!focusNFe) {
      // Tratar aqui caso nao tenha integração com a focus
      throw new BadRequestException('Nenhuma integração Focus NFe encontrada');
    }

    const notaFiscalRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<NotaFiscalWorkspaceEntity>(
        workspaceId,
        'notaFiscal',
        { shouldBypassPermissionChecks: true },
      );

    const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

    /* Campos obrigatorios, company:

      company.cpfCnpj
      company.name
      company.address.addressStreet1
      company.address.addressNumber
      company.address.addressStreet2
      company.address.addressCity
      company.address.addressState
      company.address.addressPostcode
      company.emails.primaryEmail
    */
     
    if (company.percentNfcom && company.percentNfcom > 0) {
      this.logger.log('CAIU NFCom');

      const cfop = this.getCfopForCommunication(
        focusNFe.state,               // estado do emissor
        company.address.addressState, // estado do cliente
      );

      let nfCom = notaFiscalRepository.create({
        name: `${getNfTypeLabel(NfType.NFCOM)} ${financialClosing.name} - ${today} - ${company.name}`,
        nfType: NfType.NFCOM, // Puxar da company
        nfStatus: NfStatus.DRAFT,
        dataEmissao: new Date().toISOString(),
        // numeroRps: company.numeroRps,
        totalAmount: typeof charge.price === "number" 
          ? charge.price.toString() 
          : charge.price,
        // percentNfe: company.percentNfe,
        // percentNfse: company.percentNfse,
        // percentNfce: company.percentNfce,
        percentNfcom: company.percentNfcom,
        // ncm: company.ncm,
        cfop: cfop,
        cstIcmsCsosn: "00",
        // origem: company.origem,
        // aliquotaIcms: company.aliquotaIcms,
        // aliquotaPis: company.aliquotaPis,
        // aliquotaCofins: company.aliquotaCofins,
        // aliquotaIpi: company.aliquotaIpi,0
        // aliquotaIss: company.aliquotaIss,
        // issRetido: company.issRetido,
        unitOfMeasure: "4", // 4 - 'UN'
        unidade: "1.00",
        // itemListaServico: company.itemListaServico,
        // discriminacao: company.discriminacao,
        classificacao: '0100101', // 	Assinatura de serviços de telefonia (Tabela cClass NFCom)
        codAssinante: company.id.substring(0, 30),
        numContratoAssinante: `${NfType.NFCOM}-${charge.id}`.substring(0, 15),
        // position: company.position,
        // justificativa: company.justificativa,

        company: company,
        companyId: company.id,
        charge: charge,
        chargeId: charge.id,
        focusNFe: focusNFe,
        focusNFeId: focusNFe.id,
      });

      nfCom = await notaFiscalRepository.save(nfCom);

      nfCom.company = company;

      this.logger.log(`NOTA FISCALL CRIADA: ${JSON.stringify(nfCom, null, 2)}`);

      const fakeProductNfCom = {
        id: nfCom.id,
        name: 'Plano de telefonia',
        producttype: ProductTypeStatus.COMMODITY,
        unitOfMeasure: "4", // 4 - 'UN'
        unidade: "1",
        classificacao: '0100101',
        cstIcmsCsosn: "00", // Caso Regime normal 00, caso Simples Nacional (SN) 102.
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as ProductWorkspaceEntity;

      const issueResult = await this.focusNFeService.preIssueNf(nfCom, workspaceId, fakeProductNfCom);

      if (issueResult && issueResult.success) {
        this.logger.log(`NOTA FISCAL EMITIDA: ${JSON.stringify(issueResult.data, null, 2)}`);

        nfCom.nfStatus = NfStatus.IN_PROCESS; // Webhook atualiza para ISSUED assim que processado
        await notaFiscalRepository.save(nfCom);

      } else {
        if (issueResult) {
          this.logger.error(`NOTA FISCAL NAO EMITIDA: ${JSON.stringify(issueResult.data, null, 2)}`);
        } else {
          this.logger.error(`NOTA FISCAL NAO EMITIDA E SEM RETORNO: ${JSON.stringify(issueResult, null, 2)}`);
        }

        nfCom.nfStatus = NfStatus.CANCELLED;
        await notaFiscalRepository.save(nfCom);
      }
    }

    if (company.percentNfse && company.percentNfse > 0) {

      this.logger.log('CAIU NFSE');

      let nfse = notaFiscalRepository.create({
        name: `${getNfTypeLabel(NfType.NFSE)} ${financialClosing.name} - ${today} - ${company.name}`,
        nfType: NfType.NFSE,
        nfStatus: NfStatus.DRAFT,
        dataEmissao: new Date().toISOString(),
        totalAmount: typeof charge.price === "number" 
          ? charge.price.toString() 
          : charge.price,

        aliquotaIss: 0.05, // Varia de acordo com o municipio, 2% a 5%
        discriminacao: "Serviço de telefonia",
        issRetido: false,
        itemListaServico: "2919",
        percentNfse: company.percentNfse,

        company: company,
        companyId: company.id,
        charge: charge,
        chargeId: charge.id,
        focusNFe: focusNFe,
        focusNFeId: focusNFe.id,
      });

      nfse = await notaFiscalRepository.save(nfse);

      nfse.company = company;

      this.logger.log(`NOTA FISCALL CRIADA nfse: ${JSON.stringify(nfse, null, 2)}`);

      const fakeProductNfse = {
        id: nfse.id,
        name: 'Plano de telefonia',
        issRetido: false,
        producttype: ProductTypeStatus.SERVICE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as ProductWorkspaceEntity;

      const issueResult = await this.focusNFeService.preIssueNf(nfse, workspaceId, fakeProductNfse);

      if (issueResult && issueResult.success) {
        this.logger.log(`NOTA FISCAL EMITIDA: ${JSON.stringify(issueResult.data, null, 2)}`);

        nfse.nfStatus = NfStatus.IN_PROCESS; // Webhook atualiza para ISSUED assim que processado
        
        await notaFiscalRepository.save(nfse);

      } else {
        if (issueResult) {
          this.logger.error(`NOTA FISCAL NAO EMITIDA: ${JSON.stringify(issueResult.data, null, 2)}`);
        } else {
          this.logger.error(`NOTA FISCAL NAO EMITIDA E SEM RETORNO: ${JSON.stringify(issueResult, null, 2)}`);
        }

        nfse.nfStatus = NfStatus.CANCELLED;
        await notaFiscalRepository.save(nfse);
      }
    }
  }

  private getCfopForCommunication(
    emitterState: string,
    clientState: string,
  ): string {
    if (!emitterState || !clientState) {
      throw new Error('Estados do emissor e do cliente são obrigatórios para definir o CFOP.');
    }

    const normalizedEmitter = emitterState.trim().toUpperCase();
    const normalizedClient = clientState.trim().toUpperCase();

    // Exterior → não tem UF válida no Brasil
    const validUFs = [
      'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR',
      'PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
    ];
    const isClientExterior = !validUFs.includes(normalizedClient);

    if (isClientExterior) {
      return '7307'; // Prestação para exterior
    }

    if (normalizedEmitter === normalizedClient) {
      return '5307'; // Prestação dentro do estado
    }

    return '6307'; // Prestação interestadual
  }
}