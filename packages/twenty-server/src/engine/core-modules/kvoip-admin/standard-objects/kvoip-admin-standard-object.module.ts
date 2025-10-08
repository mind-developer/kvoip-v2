import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KvoipAdminModule } from 'src/engine/core-modules/kvoip-admin/kvoip-admin.module';
import { SubscriptionService } from 'src/engine/core-modules/kvoip-admin/standard-objects/subscription/services/subscription.service';
import { BillingSubscriptionSubscriber } from 'src/engine/core-modules/kvoip-admin/standard-objects/subscription/subscribers/billing-subscription.subscriber';
import { OwnerWorkspaceMemberListener } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/listeners/owner-workspace-member.listener';
import { OwnerService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/owner.service';
import { TenantService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/tenant.service';
import { UserSubscriber } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/subscribers/user.subscriber';
import { WorkspaceSubscriber } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/subscribers/worskspace.subsciber';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace]),
    forwardRef(() => KvoipAdminModule),
  ],
  providers: [
    OwnerWorkspaceMemberListener,
    WorkspaceSubscriber,
    UserSubscriber,
    OwnerService,
    TenantService,
    SubscriptionService,
    BillingSubscriptionSubscriber,
  ],
  exports: [TenantService],
})
export class KvoipAdminStandardObjectModule {}
