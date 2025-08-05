import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
import { In } from 'typeorm';

export async function getCompaniesForFinancialClosing(
    workspaceId: string,
    twentyORMGlobalManager: TwentyORMGlobalManager,
    financialClosing: FinancialClosing,
): Promise<CompanyWorkspaceEntity[]> {
    const companiesRepository =
    await twentyORMGlobalManager.getRepositoryForWorkspace<CompanyWorkspaceEntity>(
      workspaceId,
      'company',
      {
        shouldBypassPermissionChecks: true,
      },
    );

    const companies = await companiesRepository.find({
        where: {
            billingModel: In(financialClosing.billingModelIds),
        },
        // relations: {
        //   person: true,
        //   company: true,
        // },
    });

    return companies || [];
}

