import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined, removeUndefinedFields } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { KvoipAdminService } from 'src/engine/core-modules/kvoip-admin/services/kvoip-admin.service';
import { transformCoreWorkspaceToWorkspaces } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/utils/transform-core-workpace-to-workspaces.util';
import { transformWorkspaceMemberToOwner } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/utils/transfsorm-workspace-member-to-owner.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { OwnerWorkspaceEntity } from 'src/modules/workspaces/standard-objects/owner.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/workspaces/standard-objects/tenant.workspace-entity';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
    private readonly kvoipAdminService: KvoipAdminService,
  ) {}

  // TODO: This is a exemple on how to manipulate entity repositories inside typeorm subcribers, Move this to a README file inside kvoip-admin module.
  private get workspaceRepository() {
    return this.dataSource.getRepository(Workspace);
  }

  async handleWorkspaceUpsert(workspace: Workspace) {
    const adminWorkspace = await this.kvoipAdminWorkspaceExists();

    if (!isDefined(adminWorkspace)) return;

    const existingWorkspace = await this.workspaceRepository.findOneBy([
      {
        id: workspace.id,
      },
      {
        creatorEmail: workspace.creatorEmail,
      },
    ]);

    if (!isDefined(existingWorkspace)) return;

    // Prevent upserting the admin workspace tenant
    if (existingWorkspace.id === adminWorkspace.id) return;

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
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspace.id,
          'workspaceMember',
        );

      const existingWokrpsaceMember = await workspaceMemberRepository.findOne({
        where: {
          userEmail: workspace?.creatorEmail,
        },
      });

      if (isDefined(existingWokrpsaceMember)) {
        const ownerRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<OwnerWorkspaceEntity>(
            adminWorkspace.id,
            'owner',
          );

        const existingOwner = await ownerRepository.findOne({
          where: {
            emails: {
              primaryEmail: existingWokrpsaceMember.userEmail,
            },
          },
        });

        await ownerRepository.save({
          ...existingOwner,
          ...transformWorkspaceMemberToOwner(existingWokrpsaceMember),
          emails: {
            primaryEmail: existingWokrpsaceMember.userEmail,
          },
        });
      }
    }
  }

  async handleWorkspaceDelete(workspaceId: string) {
    const adminWorkspace = await this.kvoipAdminWorkspaceExists();

    if (!isDefined(adminWorkspace) || adminWorkspace.id === workspaceId) return;

    const tenantRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TenantWorkspaceEntity>(
        adminWorkspace.id,
        'tenant',
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
