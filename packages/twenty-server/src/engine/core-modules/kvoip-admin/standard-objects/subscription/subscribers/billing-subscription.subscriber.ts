import { Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionService } from 'src/engine/core-modules/kvoip-admin/standard-objects/subscription/services/subscription.service';
import { isDefined } from 'twenty-shared/utils';

@EventSubscriber()
export class BillingSubscriptionSubscriber
  implements EntitySubscriberInterface<BillingSubscription>, OnModuleInit
{
  private readonly logger = new Logger(BillingSubscriptionSubscriber.name);

  private subscriptionService: SubscriptionService;

  constructor(
    private readonly moduleRef: ModuleRef,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.dataSource.subscribers.push(this);
  }

  async onModuleInit() {
    this.subscriptionService =
      await this.moduleRef.resolve(SubscriptionService);
  }

  listenTo() {
    return BillingSubscription;
  }

  async afterInsert(event: InsertEvent<BillingSubscription>) {
    try {
      const { id, stripeSubscriptionId, interBillingChargeId } = event.entity;

      if (
        isDefined(id) ||
        isDefined(stripeSubscriptionId) ||
        isDefined(interBillingChargeId)
      ) {
        await this.subscriptionService.handleSubscriptionUpsert({
          id,
          stripeSubscriptionId,
          interBillingChargeId,
        });
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  async afterUpdate(event: UpdateEvent<BillingSubscription>) {
    try {
      const { id, stripeSubscriptionId, interBillingChargeId } =
        event.entity as Partial<BillingSubscription>;

      if (
        isDefined(id) ||
        isDefined(stripeSubscriptionId) ||
        isDefined(interBillingChargeId)
      ) {
        await this.subscriptionService.handleSubscriptionUpsert({
          id,
          stripeSubscriptionId,
          interBillingChargeId,
        });
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
