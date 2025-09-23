import { Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

import { OwnerService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/owner.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@EventSubscriber()
export class UserSubscriber
  implements EntitySubscriberInterface<User>, OnModuleInit
{
  private readonly logger = new Logger(UserSubscriber.name);

  private ownerService: OwnerService;

  constructor(
    private readonly moduleRef: ModuleRef,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.dataSource.subscribers.push(this);
  }

  async onModuleInit() {
    this.ownerService = await this.moduleRef.resolve(OwnerService);
  }

  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>) {
    if (isDefined(event.entity.id) || isDefined(event.entity.email)) {
      await this.ownerService.handleOwnerUpsert({
        user: event.entity,
      });
    }
  }

  async afterUpdate(event: UpdateEvent<User>) {
    if (
      isDefined(event.entity) &&
      (isDefined(event.entity.id) || isDefined(event.entity.creatorEmail))
    ) {
      await this.ownerService.handleOwnerUpsert({
        user: event.entity as User,
      });
    }
  }
}
