/* @license Enterprise */

import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CreateKvoipAdminWorkspaceCommandService } from 'src/engine/core-modules/kvoip-admin/commands/services/create-kvoip-admin-workspace-command.service';
import { KVOIP_ADMIN_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-billing-subscription';
import { KVOIP_ADMIN_FEATURE_FLAGS } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-feature-flags';
import { KVOIP_ADMIN_USER } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-user';
import { KVOIP_ADMIN_USER_WORKSPACES } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-user-workspaces';
import { KVOIP_ADMIN_WORKSPACE } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-workspace';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

interface CreateKvoipAdminWorkspaceCommandOptions {
  dryRun?: boolean;
}

@Command({
  name: 'kvoip:add-admin-workspace',
  description: 'Add admin kvoip admin workspace',
})
export class CreateKvoipAdminWorkspaceCommand extends CommandRunner {
  private logger: Logger = new Logger(CreateKvoipAdminWorkspaceCommand.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly createKvoipAdminWorkspaceCommandService: CreateKvoipAdminWorkspaceCommandService,
  ) {
    super();
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Simulate the command without making actual changes',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  async run(
    passedParams: string[],
    options?: CreateKvoipAdminWorkspaceCommandOptions,
  ): Promise<void> {
    const mainDataSource = this.typeORMService.getMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');

    if (isBillingEnabled)
      await this.billingSubscriptionRepository.upsert(
        KVOIP_ADMIN_BILLING_SUBSCRIPTION,
        {
          conflictPaths: ['stripeSubscriptionId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );

    const appVersion = this.twentyConfigService.get('APP_VERSION');

    const kvoipAdminInviteHash = this.twentyConfigService.get(
      'KVOIP_ADMIN_INVITE_HASH',
    );

    if (options?.dryRun) {
      this.logger.log('Dry run mode enabled. No changes will be made.');

      return;
    }

    await this.workspaceRepository.upsert(
      {
        ...KVOIP_ADMIN_WORKSPACE,
        inviteHash: kvoipAdminInviteHash,
        version: appVersion,
      },
      ['id'],
    );

    await this.userRepository.upsert(KVOIP_ADMIN_USER, ['id']);

    await this.userWorkspaceRepository.upsert(KVOIP_ADMIN_USER_WORKSPACES, [
      'id',
    ]);

    await this.featureFlagRepository.upsert(KVOIP_ADMIN_FEATURE_FLAGS, {
      conflictPaths: ['key', 'workspaceId'],
    });

    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        KVOIP_ADMIN_WORKSPACE.id,
      );

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        KVOIP_ADMIN_WORKSPACE.id,
        schemaName,
      );

    const featureFlags =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(
        KVOIP_ADMIN_WORKSPACE.id,
      );

    await this.workspaceSyncMetadataService.synchronize({
      workspaceId: KVOIP_ADMIN_WORKSPACE.id,
      dataSourceId: dataSourceMetadata.id,
      featureFlags,
    });

    await this.createKvoipAdminWorkspaceCommandService.initPermissions(
      KVOIP_ADMIN_WORKSPACE.id,
    );

    await this.createKvoipAdminWorkspaceCommandService.seed({
      schemaName: dataSourceMetadata.schema,
      workspaceId: KVOIP_ADMIN_WORKSPACE.id,
    });

    await this.workspaceCacheStorageService.flush(
      KVOIP_ADMIN_WORKSPACE.id,
      undefined,
    );
  }
}
