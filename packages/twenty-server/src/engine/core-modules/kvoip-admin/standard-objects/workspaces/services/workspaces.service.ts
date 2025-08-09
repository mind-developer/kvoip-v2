import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { transformCoreWorkspaceToWorkspaces } from 'src/engine/core-modules/kvoip-admin/standard-objects/workspaces/utils/transform-core-workpace-to-workspaces.util';
import { transformWorkspaceMemberToOwner } from 'src/engine/core-modules/kvoip-admin/standard-objects/workspaces/utils/transfsorm-workspace-member-to-owner.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { OwnerWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/owner-entity';
import { WorkspacesWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/workspaces-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async handleWorkspaceUpsert(workspace: Workspace) {
    if (!(await this.kvoipAdminWorkspaceExists())) return;

    const workspacesRepository =
      await this.twentyORMManager.getRepository<WorkspacesWorkspaceEntity>(
        'workspaces',
      );

    const workspaceMemberRepository =
      await this.twentyORMManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
      );

    await workspacesRepository.upsert(
      transformCoreWorkspaceToWorkspaces(workspace),
      {
        conflictPaths: ['coreWorkspaceId'],
      },
    );

    if (isDefined(workspace?.creatorEmail)) {
      const ownerWorkspaceMember = await workspaceMemberRepository.findOne({
        where: {
          userEmail: workspace?.creatorEmail,
        },
      });

      if (isDefined(ownerWorkspaceMember)) {
        const ownerRepository =
          await this.twentyORMManager.getRepository<OwnerWorkspaceEntity>(
            'owner',
          );

        await ownerRepository.upsert(
          {
            ...transformWorkspaceMemberToOwner(ownerWorkspaceMember),
            emails: {
              primaryEmail: ownerWorkspaceMember.userEmail,
            },
          },
          {
            conflictPaths: ['userId'],
          },
        );
      }
    }
  }

  async handleWorkspaceDelete(workspaceId: string) {
    if (!(await this.kvoipAdminWorkspaceExists())) return;

    const workspacesRepository =
      await this.twentyORMManager.getRepository<WorkspacesWorkspaceEntity>(
        'workspaces',
      );

    const workspaceToDelete = await workspacesRepository.findOne({
      where: {
        coreWorkspaceId: workspaceId,
      },
    });

    if (isDefined(workspaceToDelete)) {
      await workspacesRepository.delete(workspaceToDelete.id);
    }
  }

  async kvoipAdminWorkspaceExists(): Promise<boolean> {
    const kvoipAdminWorkspace = await this.workspaceRepository.findOne({
      where: {
        featureFlags: {
          key: FeatureFlagKey.IS_KVOIP_ADMIN,
          value: true,
        },
      },
    });

    return isDefined(kvoipAdminWorkspace);
  }
}
