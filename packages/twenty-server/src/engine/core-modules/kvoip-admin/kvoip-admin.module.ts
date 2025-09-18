import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CreateKvoipAdminWorkspaceCommand } from 'src/engine/core-modules/kvoip-admin/commands/create-kvoip-admin-workspace.command';
import { CreateKvoipAdminWorkspaceCommandService } from 'src/engine/core-modules/kvoip-admin/commands/services/create-kvoip-admin-workspace-command.service';
import { KvoipAdminService } from 'src/engine/core-modules/kvoip-admin/services/kvoip-admin.service';
import { KvoipAdminStandardObjectModule } from 'src/engine/core-modules/kvoip-admin/standard-objects/kvoip-admin-standard-object.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Workspace,
        User,
        UserWorkspace,
        ObjectMetadataEntity,
        FeatureFlag,
        BillingSubscription,
      ],
      'core',
    ),
    TypeORMModule,
    WorkspaceModule,
    UserWorkspaceModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    WorkspaceDataSourceModule,
    WorkspaceCacheStorageModule,
    DataSourceModule,
    RoleModule,
    UserRoleModule,
    FeatureFlagModule,
    WorkspaceSyncMetadataModule,
    ObjectPermissionModule,
    KvoipAdminStandardObjectModule,
  ],
  providers: [
    CreateKvoipAdminWorkspaceCommand,
    CreateKvoipAdminWorkspaceCommandService,
    KvoipAdminService,
  ],
  exports: [KvoipAdminService],
})
export class KvoipAdminModule {}
