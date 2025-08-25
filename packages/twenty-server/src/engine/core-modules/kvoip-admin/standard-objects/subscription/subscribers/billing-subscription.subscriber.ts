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
    this.logger.log(event.entity);
    // if (isDefined(event.entity.id) || isDefined(event.entity.email)) {
    //   await this.SubscriptionService.handleOwnerUpsert({
    //     BillingSubscription: event.entity,
    //   });
    // }
  }

  async afterUpdate(event: UpdateEvent<BillingSubscription>) {
    this.logger.log(event.entity);
    // if (
    //   isDefined(event.entity) &&
    //   (isDefined(event.entity.id) || isDefined(event.entity.creatorEmail))
    // ) {
    //   await this.SubscriptionService.handleOwnerUpsert({
    //     BillingSubscription: event.entity as BillingSubscription,
    //   });
    // }
  }
}
