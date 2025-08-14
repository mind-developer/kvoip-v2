import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KvoipAdminModule } from 'src/engine/core-modules/kvoip-admin/kvoip-admin.module';
import { WorkspacesMeberistener } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/listeners/workspace-member.listener';
import { OwnerService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/owner.service';
import { TenantService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/tenant.service';
import { UserSubscriber } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/subscribers/user.subscriber';
import { WorkspaceSubscriber } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/subscribers/worskspace.subsciber';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    forwardRef(() => KvoipAdminModule),
  ],
  providers: [
    WorkspacesMeberistener,
    WorkspaceSubscriber,
    UserSubscriber,
    OwnerService,
    TenantService,
  ],
  exports: [TenantService],
})
export class KvoipAdminStandardObjectModule {}
