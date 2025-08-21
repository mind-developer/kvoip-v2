import { BadRequestException, Injectable } from '@nestjs/common';
import { FinancialClosing } from './financial-closing.entity';
import { Logger } from '@nestjs/common';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { FocusNFeWorkspaceEntity } from 'src/modules/focus-nfe/standard-objects/focus-nfe.workspace-entity';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';

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

    let nf = notaFiscalRepository.create({

      // 🔹 Metadados básicos
      name: `NF ${financialClosing.name} - ${today} - ${company.name}`,
      nfType: NfType.NFCOM, // Puxar da company
      nfStatus: 'draft',
      dataEmissao: new Date().toISOString(),
      // numeroRps: company.numeroRps,

      // ---------------------------
      // 🔹 Valores financeiros
      totalAmount: typeof charge.price === "number" 
        ? charge.price.toString() 
        : charge.price,
      // percentNfe: company.percentNfe,
      // percentNfse: company.percentNfse,
      // percentNfce: company.percentNfce,
      // percentNfcom: company.percentNfcom,

      // // ---------------------------
      // // 🔹 Tributação
      // ncm: company.ncm,
      // cfop: company.cfop,
      // cstIcmsCsosn: company.cstIcmsCsosn,
      // origem: company.origem,
      // aliquotaIcms: company.aliquotaIcms,
      // aliquotaPis: company.aliquotaPis,
      // aliquotaCofins: company.aliquotaCofins,
      // aliquotaIpi: company.aliquotaIpi,0
      // aliquotaIss: company.aliquotaIss,
      // issRetido: company.issRetido,

      // // ---------------------------
      // // 🔹 Produto / Serviço
      // unitOfMeasure: company.unitOfMeasure,
      // unidade: company.unidade,
      // itemListaServico: company.itemListaServico,
      // discriminacao: company.discriminacao,
      // classificacao: company.classificacao,
      // codAssinante: company.codAssinante,
      // numContratoAssinante: company.numContratoAssinante,

      // // ---------------------------
      // // 🔹 Controle interno
      // position: company.position,
      // justificativa: company.justificativa,

      // // ---------------------------
      // // 🔹 Relações
      company: company,
      companyId: company.id,
      charge: charge,
      chargeId: charge.id,
      // product: company.product,
      // productId: company.productId,
      focusNFe: focusNFe,
      focusNFeId: focusNFe.id,
    });

    nf = await notaFiscalRepository.save(nf);

    nf.company = company;

    this.logger.log(`NOTA FISCALL CRIADA: ${JSON.stringify(nf, null, 2)}`);

    const fakeProduct = {
      id: 'fake-product-id',
      name: 'Serviço de Consultoria',
      unitOfMeasure: 'UN',
      unidade: 'Unidade',
      classificacao: '1234',
      ncm: '12345678',
      cfop: '5102',
      cstIcmsCsosn: '102',
      origem: 0,
      aliquotaIcms: 0,
      aliquotaPis: 0,
      aliquotaCofins: 0,
      valorIpi: 0,
      aliquotaIss: 2,
      issRetido: false,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as ProductWorkspaceEntity;


    const issueResult = await this.focusNFeService.preIssueNf(nf, workspaceId, fakeProduct);

  }
}