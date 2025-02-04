import { Module } from '@nestjs/common';

import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { UpgradeTo0_40CommandModule } from 'src/database/commands/upgrade-version/0-40/0-40-upgrade-version.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { SeederModule } from 'src/engine/seeder/seeder.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';

@Module({
  imports: [
    UpgradeVersionCommandModule,

    // Only needed for the data seed command
    TypeORMModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    SeederModule,
    WorkspaceManagerModule,
    DataSourceModule,
    TypeORMModule,
    TypeOrmModule.forFeature(
      [Workspace, BillingSubscription, FeatureFlagEntity],
      'core',
    ),
    TypeOrmModule.forFeature(
      [FieldMetadataEntity, ObjectMetadataEntity],
      'metadata',
    ),
    WorkspaceModule,
    WorkspaceDataSourceModule,
    WorkspaceSyncMetadataModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSeedDemoWorkspaceModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    UpgradeTo0_40CommandModule,
    FeatureFlagModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    DataSeedDemoWorkspaceCommand,
    ConfirmationQuestion,
    StartDataSeedDemoWorkspaceCronCommand,
    StopDataSeedDemoWorkspaceCronCommand,
  ],
  providers: [DataSeedWorkspaceCommand, ConfirmationQuestion],
})
export class DatabaseCommandModule {}
