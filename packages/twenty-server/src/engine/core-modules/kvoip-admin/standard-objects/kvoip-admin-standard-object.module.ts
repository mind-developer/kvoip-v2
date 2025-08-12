import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KvoipAdminModule } from 'src/engine/core-modules/kvoip-admin/kvoip-admin.module';
import { UpdateWorkspacesMebersCountListener } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/listeners/update-workspaces-members-count.listener';
import { TenantService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/tenant.service';
import { WorkspaceSubscriber } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/subscribers/worskspace.subsciber';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    forwardRef(() => KvoipAdminModule),
  ],
  providers: [
    UpdateWorkspacesMebersCountListener,
    WorkspaceSubscriber,
    TenantService,
  ],
  exports: [TenantService],
})
export class KvoipAdminStandardObjectModule {}
