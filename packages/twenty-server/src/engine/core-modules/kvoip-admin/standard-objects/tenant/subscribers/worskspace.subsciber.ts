import { Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

import { TenantService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/tenant.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@EventSubscriber()
export class WorkspaceSubscriber
  implements EntitySubscriberInterface<Workspace>, OnModuleInit
{
  private readonly logger = new Logger(WorkspaceSubscriber.name);

  private tenantService: TenantService;

  constructor(
    private readonly moduleRef: ModuleRef,
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
  ) {
    this.dataSource.subscribers.push(this);
  }

  async onModuleInit() {
    this.tenantService = await this.moduleRef.resolve(TenantService);
  }

  listenTo() {
    return Workspace;
  }

  async afterInsert(event: InsertEvent<Workspace>) {
    await this.tenantService.handleWorkspaceUpsert(event.entity);
  }

  async afterUpdate(event: UpdateEvent<Workspace>) {
    if (isDefined(event.entity)) {
      await this.tenantService.handleWorkspaceUpsert(event.entity as Workspace);
    }
  }

  async afterRemove(event: RemoveEvent<Workspace>) {
    if (isDefined(event.entity)) {
      await this.tenantService.handleWorkspaceDelete(event.entity.id);
    }
  }
}
