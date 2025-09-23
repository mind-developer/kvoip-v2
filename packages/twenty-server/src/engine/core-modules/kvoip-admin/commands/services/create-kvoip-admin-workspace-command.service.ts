import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { KVOIP_ADMIN_USER } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-user';
import { KVOIP_ADMIN_USER_WORKSPACES } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-user-workspaces';
import {
  KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEEDS,
  KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEED_COLUMNS,
} from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-workspace-member';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { prefillViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-views';
import { prefillWorkspaceFavorites } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workspace-favorites';

const RECORD_SEEDS_CONFIGS = [
  {
    tableName: 'workspaceMember',
    pgColumns: KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEED_COLUMNS,
    recordSeeds: KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEEDS,
  },
];

@Injectable()
export class CreateKvoipAdminWorkspaceCommandService {
  constructor(
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  public async initPermissions(workspaceId: string) {
    const adminRole = await this.roleService.createAdminRole({
      workspaceId,
    });

    const adminUserWorkspaceId = KVOIP_ADMIN_USER_WORKSPACES.find(
      (userWorkspace) => userWorkspace.userId === KVOIP_ADMIN_USER.id,
    )?.id;

    if (!adminUserWorkspaceId)
      throw new Error('Admin user workspace not found');

    await this.userRoleService.assignRoleToUserWorkspace({
      workspaceId,
      userWorkspaceId: adminUserWorkspaceId,
      roleId: adminRole.id,
    });

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
    });

    await this.workspaceRepository.update(workspaceId, {
      defaultRoleId: memberRole.id,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    });
  }

  public async seed({
    schemaName,
    workspaceId,
  }: {
    schemaName: string;
    workspaceId: string;
  }) {
    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    await this.coreDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        for (const recordSeedsConfig of RECORD_SEEDS_CONFIGS) {
          const objectMetadata = objectMetadataItems.find(
            (item) =>
              computeTableName(item.nameSingular, item.isCustom) ===
              recordSeedsConfig.tableName,
          );

          if (!objectMetadata) {
            continue;
          }

          await this.seedRecords({
            entityManager,
            schemaName,
            tableName: recordSeedsConfig.tableName,
            pgColumns: recordSeedsConfig.pgColumns,
            recordSeeds: recordSeedsConfig.recordSeeds,
          });
        }

        // For now views/favorites are auto-created for custom
        // objects but not for standard objects.
        // This is probably something we want to fix in the future.

        const viewDefinitionsWithId = await prefillViews(
          entityManager,
          schemaName,
          objectMetadataItems.filter((item) => !item.isCustom),
          undefined,
          true,
        );

        await prefillWorkspaceFavorites(
          viewDefinitionsWithId
            .filter(
              (view) =>
                view.key === 'INDEX' &&
                shouldSeedWorkspaceFavorite(
                  view.objectMetadataId,
                  objectMetadataItems,
                ),
            )
            .map((view) => view.id),
          entityManager,
          schemaName,
        );
      },
    );
  }

  private async seedRecords({
    entityManager,
    schemaName,
    tableName,
    pgColumns,
    recordSeeds,
  }: {
    entityManager: WorkspaceEntityManager;
    schemaName: string;
    tableName: string;
    pgColumns: string[];
    recordSeeds: Record<string, unknown>[];
  }) {
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(`${schemaName}.${tableName}`, pgColumns)
      .orIgnore()
      .values(recordSeeds)
      .returning('*')
      .execute();
  }
}
