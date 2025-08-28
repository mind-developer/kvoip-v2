import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { KvoipAdminService } from 'src/engine/core-modules/kvoip-admin/services/kvoip-admin.service';
import { transformDatabaseBillingSubscriptionToSubscriptionWorkspaceEntity } from 'src/engine/core-modules/kvoip-admin/standard-objects/subscription/utils/transform-database-billing-subscription-to-subscription-workspace-entity.util';
import { translformDatabaseProductActiveToSubscriptonPlanStatus } from 'src/engine/core-modules/kvoip-admin/standard-objects/subscription/utils/transform-database-product-active-to-subscription-plan-status.util';
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

  private get billingSubscriptionRepository() {
    return this.dataSource.getRepository(BillingSubscription);
  }

  private async getBaseProductFromBillingSubscription(
    subscription: BillingSubscription,
  ) {

    if(subscription.billingSubscriptionItems.length === 0) throw new Error('Subscrioption doesnt contain any items.')

    const baseProdcut = subscription.billingSubscriptionItems.find((item) => 
      item.billingProduct.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT
    )?.billingProduct;

    if (!isDefined(baseProdcut))
      throw new Error('Base product not fond for subscription');

    return baseProdcut;
  }

  private async handleUpsertSubscriptionPlanFromProduct(
    product: BillingProduct,
  ) {
    const subscriptionPlanWorkspaceRepository =
      await this.kvoipAdminService.getSubscriptionPlanRepository();

    const status = translformDatabaseProductActiveToSubscriptonPlanStatus(
      product.active,
    );

    const exsitingSubscriptionPlan =
      await subscriptionPlanWorkspaceRepository.findOne({
        where: {
          planKey: product.metadata.planKey,
          status,
        },
      });

    return await subscriptionPlanWorkspaceRepository.save({
      ...exsitingSubscriptionPlan,
      name: product.metadata.planKey,
      planKey: product.metadata.planKey,
      status,
    });
  }

  private async upsertWorkspaceSubscription(
    billingSubscription: BillingSubscription,
  ) {
    const tenantRepository = await this.kvoipAdminService.getTenantRepository();

    const tenant = await tenantRepository.findOne({
      where: {
        coreWorkspaceId: billingSubscription.workspaceId,
      },
      relations: {
        owner: true,
      },
    });

    if (!isDefined(tenant))
      throw new Error('Workspace not found inside admin workspace.');

    const subscriptionBaseProduct =
      await this.getBaseProductFromBillingSubscription(billingSubscription);

    const activePrice = subscriptionBaseProduct.billingPrices.find(
      (price) => price.active,
    );

    if (!isDefined(activePrice)) throw new Error('Price not found');

    const subscriptionPlan = await this.handleUpsertSubscriptionPlanFromProduct(
      subscriptionBaseProduct,
    );

    const subscriptionWorkspaceRepository =
      await this.kvoipAdminService.getSubscriptionRepository();

    const existingSubscription = await subscriptionWorkspaceRepository.findOne({
      where: {
        billingSubscriptionId: billingSubscription.id,
      },
    });

    await subscriptionWorkspaceRepository.save({
      ...existingSubscription,
      ...transformDatabaseBillingSubscriptionToSubscriptionWorkspaceEntity({
        billingSubscription,
        price: activePrice,
        tenantId: tenant.id,
        subscriptionPlanId: subscriptionPlan.id,
        ownerId: tenant?.owner?.id,
      }),
    });
  }

  async handleSubscriptionUpsert({
    id,
    stripeSubscriptionId,
  }: {
    id?: string;
    stripeSubscriptionId?: string;
  }) {
    const subscription = await this.billingSubscriptionRepository.findOneOrFail({
      where: [
        {
          id,
        },
        {
          stripeSubscriptionId,
        },
      ],
      relations: {
        billingSubscriptionItems: {
          billingProduct: {
            billingPrices: true,
          },
        },
      },
    });

    if (!isDefined(subscription))
      throw new Error('BillingSubscription not found.');

    await this.upsertWorkspaceSubscription(subscription);
  }
}
