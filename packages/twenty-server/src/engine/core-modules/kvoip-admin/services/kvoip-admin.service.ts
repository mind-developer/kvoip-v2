import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { ObjectLiteral, Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { OwnerWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/owner.workspace-entity';
import { SubscriptionPlanWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/subscription-plan.workspace-entity';
import { SubscriptionWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/subscription.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/tenant.workspace-entity';

@Injectable()
export class KvoipAdminService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async getKvoipAdminWorkspace() {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        featureFlags: {
          key: FeatureFlagKey.IS_KVOIP_ADMIN,
          value: true,
        },
      },
    });

    return workspace;
  }

  public async isKvoipAdminWorkspace(workspaceId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        featureFlags: {
          key: FeatureFlagKey.IS_KVOIP_ADMIN,
          value: true,
        },
      },
    });

    return isDefined(workspace);
  }

  public async getTenantRepository() {
    return await this.getKvoipAdminWorkspaceEntityRepository<TenantWorkspaceEntity>(
      'tenant',
    );
  }

  public async getOwnerRepository() {
    return await this.getKvoipAdminWorkspaceEntityRepository<OwnerWorkspaceEntity>(
      'owner',
    );
  }

  public async getSubscriptionRepository() {
    return await this.getKvoipAdminWorkspaceEntityRepository<SubscriptionWorkspaceEntity>(
      'subscription',
    );
  }

  public async getSubscriptionPlanRepository() {
    return await this.getKvoipAdminWorkspaceEntityRepository<SubscriptionPlanWorkspaceEntity>(
      'subscriptionPlan',
    );
  }

  private async getKvoipAdminWorkspaceEntityRepository<T extends ObjectLiteral>(
    metadatadaObjectName: string,
  ) {
    const adminWorkspace = await this.getKvoipAdminWorkspace();

    if (!isDefined(adminWorkspace))
      throw new Error('Admin workspace not found');

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<T>(
        adminWorkspace.id,
        metadatadaObjectName,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    return repository;
  }
}
