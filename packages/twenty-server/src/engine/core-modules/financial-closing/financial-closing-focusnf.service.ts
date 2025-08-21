import { BadRequestException, Injectable } from '@nestjs/common';
import { FinancialClosing } from './financial-closing.entity';
import { Logger } from '@nestjs/common';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';

@Injectable()
export class FinancialClosingNFService {
  private readonly logger = new Logger(FinancialClosingNFService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async emitNFForCompany(
    workspaceId: string,
    company: CompanyWorkspaceEntity, 
    // amountToBeCharged: number,
    charge: ChargeWorkspaceEntity,
    financialClosing: FinancialClosing, 
  ): Promise<any> {

    this.logger.log(`TESTE CAIU NA EMISSAO DA NOTA FISCAL - ${company.name}`)
    
    const notaFiscalRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<NotaFiscalWorkspaceEntity>(
        workspaceId,
        'notaFiscal',
        { shouldBypassPermissionChecks: true },
      );

    let nf = notaFiscalRepository.create({

      // 🔹 Metadados básicos
      name: `NF ${financialClosing.name} - ${company.name}`,
      // nfType: company.nfType,
      // nfStatus: 'draft',
      // dataEmissao: new Date().toISOString(),
      // numeroRps: company.numeroRps,

      // // ---------------------------
      // // 🔹 Valores financeiros
      // totalAmount: company.totalAmount,
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
      // aliquotaIpi: company.aliquotaIpi,
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
      // company: company,
      // companyId: company.id,
      // charge: charge,
      // chargeId: charge.id,
      // product: company.product,
      // productId: company.productId,
      // focusNFe: company.focusNFe,
      // focusNFeId: company.focusNFeId,

    });

    nf = await notaFiscalRepository.save(nf);

  }
}