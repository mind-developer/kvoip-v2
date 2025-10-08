import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { KvoipAdminService } from 'src/engine/core-modules/kvoip-admin/services/kvoip-admin.service';
import { transformDatabaseUserToOwner } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/utils/transfsorm-workspace-member-to-owner.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { OwnerWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/owner.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/tenant.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class OwnerService {
  private readonly logger = new Logger(OwnerService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly kvoipAdminService: KvoipAdminService,
  ) {}

  private get userRepository() {
    return this.dataSource.getRepository(User);
  }

  private get workspaceRepository() {
    return this.dataSource.getRepository(Workspace);
  }

  async handleOwnerUpsert({
    user,
    workspaceId,
  }: {
    user: User;
    workspaceId?: string;
  }) {
    const adminWorkspace = await this.kvoipAdminWorkspaceExists();

    if (!isDefined(adminWorkspace)) return;

    const exsitingUser = await this.userRepository.findOneBy([
      {
        email: user.email,
      },
      {
        id: user.id,
      },
    ]);

    if (!isDefined(exsitingUser)) return;

    const existingWorkspace = await this.workspaceRepository.findOneBy({
      creatorEmail: user.email,
    });

    if (!isDefined(existingWorkspace)) return;

    const ownerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<OwnerWorkspaceEntity>(
        adminWorkspace.id,
        'owner',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const existingOwner = await ownerRepository.findOne({
      where: {
        emails: {
          primaryEmail: user.email,
        },
      },
    });

    const owner = await ownerRepository.save({
      ...existingOwner,
      ...transformDatabaseUserToOwner(user),
      emails: {
        primaryEmail: user.email,
      },
    });

    const tenantRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TenantWorkspaceEntity>(
        adminWorkspace.id,
        'tenant',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const tenant = await tenantRepository.findOne({
      where: {
        coreWorkspaceId: workspaceId,
      },
    });

    if (isDefined(tenant)) {
      await tenantRepository.update(tenant.id, {
        ownerId: owner.id,
      });

      const subscriptionRepository =
        await this.kvoipAdminService.getSubscriptionRepository();

      const exsitingSubscriptionForWorkspace =
        await subscriptionRepository.findOneBy({
          tenantId: tenant.id,
        });

      if (isDefined(exsitingSubscriptionForWorkspace)) {
        await subscriptionRepository.update(
          exsitingSubscriptionForWorkspace.id,
          {
            ownerId: owner.id,
          },
        );
      }
    }
  }

  async handleOwnerWorkspaceMemberUpsert({
    userId,
    workspaceId,
    member,
  }: {
    userId: string;
    workspaceId: string;
    member: WorkspaceMemberWorkspaceEntity;
  }) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (isDefined(user)) {
      const updatedUser = await this.userRepository.save({
        id: user.id,
        firstName: member.name.firstName,
        lastName: member.name.lastName,
      });

      await this.handleOwnerUpsert({
        user: updatedUser,
        workspaceId,
      });
    }
  }

  async kvoipAdminWorkspaceExists(): Promise<Workspace | null> {
    const kvoipAdminWorkspace =
      await this.kvoipAdminService.getKvoipAdminWorkspace();

    return kvoipAdminWorkspace;
  }
}
