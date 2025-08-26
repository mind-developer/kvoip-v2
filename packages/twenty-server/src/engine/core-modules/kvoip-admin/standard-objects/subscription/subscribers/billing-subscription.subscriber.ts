import { Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionService } from 'src/engine/core-modules/kvoip-admin/standard-objects/subscription/services/subscription.service';

@EventSubscriber()
export class BillingSubscriptionSubscriber
  implements EntitySubscriberInterface<BillingSubscription>, OnModuleInit
{
  private readonly logger = new Logger(BillingSubscriptionSubscriber.name);

  private subscriptionService: SubscriptionService;

  constructor(
    private readonly moduleRef: ModuleRef,
    @InjectDataSource('core')
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
      if (
        isDefined(event.entity?.id) ||
        isDefined(event.entity?.stripeSubscriptionId)
      ) {
        await this.subscriptionService.handleSubscriptionUpsert(
          event.entity?.id || event.entity?.stripeSubscriptionId,
        );
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  async afterUpdate(event: UpdateEvent<BillingSubscription>) {
    try {
      if (
        isDefined(event.entity?.id) ||
        isDefined(event.entity?.stripeSubscriptionId)
      ) {
        await this.subscriptionService.handleSubscriptionUpsert(
          (event.entity as BillingSubscription)?.id ||
            (event.entity as BillingSubscription)?.stripeSubscriptionId,
        );
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
