import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { KvoipAdminService } from 'src/engine/core-modules/kvoip-admin/services/kvoip-admin.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
    private readonly kvoipAdminService: KvoipAdminService,
  ) {}

  private get userRepository() {
    return this.dataSource.getRepository(User);
  }

  private get workspaceRepository() {
    return this.dataSource.getRepository(Workspace);
  }

  private get subscriptionRepository() {
    return this.dataSource.getRepository(BillingSubscription);
  }

  async handleSubscriptionUpsertById(subscriptionId: BillingSubscription) {}

  async handleSubscriptionUpsertByCustomerId(
    subscriptionCustomerId: BillingSubscription,
  ) {}

  async kvoipAdminWorkspaceExists(): Promise<Workspace | null> {
    const kvoipAdminWorkspace =
      await this.kvoipAdminService.getKvoipAdminWorkspace();

    return kvoipAdminWorkspace;
  }
}
