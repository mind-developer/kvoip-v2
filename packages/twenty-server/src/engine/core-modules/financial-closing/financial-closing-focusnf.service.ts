import { BadRequestException, Injectable } from '@nestjs/common';
import { FinancialClosing } from './financial-closing.entity';
import { Logger } from '@nestjs/common';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';

@Injectable()
export class FinancialClosingNFService {
  private readonly logger = new Logger(FinancialClosingNFService.name);

  constructor(
    
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async emitNFForCompany(
    workspaceId: string,
    company: CompanyWorkspaceEntity, 
    amountToBeCharged: number,
    financialClosing: FinancialClosing, 
  ): Promise<any> {

    this.logger.log(`TESTE CAIU NA EMISSAO DA NOTA FISCAL - ${company.name}`)
    
  }
}