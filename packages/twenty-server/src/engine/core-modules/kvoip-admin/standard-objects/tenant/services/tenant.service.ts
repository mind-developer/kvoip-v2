import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined, removeUndefinedFields } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { KvoipAdminService } from 'src/engine/core-modules/kvoip-admin/services/kvoip-admin.service';
import { transformCoreWorkspaceToWorkspaces } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/utils/transform-core-workpace-to-workspaces.util';
import { transformDatabaseUserToOwner } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/utils/transfsorm-workspace-member-to-owner.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { OwnerWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/owner.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/tenant.workspace-entity';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly kvoipAdminService: KvoipAdminService,
  ) {}

  private get workspaceRepository() {
    return this.dataSource.getRepository(Workspace);
  }

  private get userRepository() {
    return this.dataSource.getRepository(User);
  }

  async handleWorkspaceUpsert(workspace: Workspace) {
    const adminWorkspace = await this.kvoipAdminWorkspaceExists();

    if (!isDefined(adminWorkspace))
      throw new Error('Kvoip admin workspace not found');

    const existingWorkspace = await this.workspaceRepository.findOneBy([
      {
        id: workspace.id,
      },
      {
        creatorEmail: workspace.creatorEmail,
      },
    ]);

    // Prevent upserting the admin workspace tenant
    if (
      isDefined(existingWorkspace) &&
      existingWorkspace.id === adminWorkspace.id
    )
      throw new Error('Current workspace is kvoip admin workspace.');

    const tenantRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TenantWorkspaceEntity>(
        adminWorkspace.id,
        'tenant',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const existingTenant = await tenantRepository.findOne({
      where: [
        {
          coreWorkspaceId: workspace.id,
        },
        {
          ownerEmail: workspace?.creatorEmail,
        },
      ],
    });

    const tenantNewData = removeUndefinedFields(
      transformCoreWorkspaceToWorkspaces({
        ...existingWorkspace,
        ...workspace,
      }),
    );

    await tenantRepository.save({
      ...existingTenant,
      ...tenantNewData,
    });

    if (isDefined(workspace.creatorEmail)) {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: workspace?.creatorEmail,
        },
      });

      if (isDefined(existingUser) && isDefined(existingWorkspace)) {
        await this.handleUserUpsert({
          user: existingUser,
          workspaceId: existingWorkspace.id,
        });
      }
    }
  }

  async handleUserUpsert({
    user,
    workspaceId,
  }: {
    user: User;
    workspaceId?: string;
  }) {
    const adminWorkspace = await this.kvoipAdminWorkspaceExists();

    if (!isDefined(adminWorkspace)) return;

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
    }
  }

  async handleWorkspaceDelete(workspaceId: string) {
    const adminWorkspace = await this.kvoipAdminWorkspaceExists();

    if (!isDefined(adminWorkspace) || adminWorkspace.id === workspaceId) return;

    const tenantRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TenantWorkspaceEntity>(
        adminWorkspace.id,
        'tenant',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const tenantToDelete = await tenantRepository.findOne({
      where: {
        coreWorkspaceId: workspaceId,
      },
    });

    if (isDefined(tenantToDelete)) {
      await tenantRepository.delete(tenantToDelete.id);
    }
  }

  async kvoipAdminWorkspaceExists(): Promise<Workspace | null> {
    const kvoipAdminWorkspace =
      await this.kvoipAdminService.getKvoipAdminWorkspace();

    return kvoipAdminWorkspace;
  }
}
