import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import {
  KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEEDS,
  KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEED_COLUMNS,
} from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-workspace-member';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { prefillCoreViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-core-views';
import { prefillWorkspaceFavorites } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workspace-favorites';
import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

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
    private readonly userRoleService: UserRoleService,
    private readonly objectMetadataService: ObjectMetadataService,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

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

        const viewDefinitionsWithId = await prefillCoreViews({
          coreDataSource: this.coreDataSource,
          workspaceId,
          schemaName,
          objectMetadataItems: objectMetadataItems.filter(
            (item) => !item.isCustom,
          ),
          shouldPrefillAdminViews: true,
        });

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

  public async setupDefaultRoles(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const adminRole = await this.roleRepository.findOne({
      where: {
        standardId: ADMIN_ROLE.standardId,
        workspaceId,
      },
    });

    if (adminRole) {
      const userWorkspace = await this.userWorkspaceRepository.findOneOrFail({
        where: { workspaceId, userId },
      });

      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: userWorkspace.id,
        roleId: adminRole.id,
      });

      await this.workspaceRepository.update(workspaceId, {
        defaultRoleId: adminRole.id,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      });
    }
  }
}
