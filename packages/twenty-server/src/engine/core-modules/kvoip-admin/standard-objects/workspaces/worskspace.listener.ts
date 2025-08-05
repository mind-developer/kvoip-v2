import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@EventSubscriber()
@Injectable()
export class WorkspaceSubscriber
  implements EntitySubscriberInterface<Workspace>
{
  private readonly logger = new Logger(WorkspaceSubscriber.name);

  constructor(
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return Workspace;
  }

  beforeInsert(event: InsertEvent<Workspace>) {
    this.logger.log(`BEFORE ENTITY INSERTED: `, event.entity);
  }

  afterInsert(event: InsertEvent<Workspace>) {
    this.logger.log(`AFTER ENTITY INSERTED: `, event.entity);
  }

  beforeUpdate(event: UpdateEvent<Workspace>) {
    this.logger.log(`BEFORE ENTITY UPDATED: `, event.entity);
  }

  afterUpdate(event: UpdateEvent<Workspace>) {
    this.logger.log(`AFTER ENTITY UPDATED: `, event.entity);
  }

  beforeRemove(event: RemoveEvent<Workspace>) {
    this.logger.log(`BEFORE ENTITY REMOVED: `, event.entity);
  }

  afterRemove(event: RemoveEvent<Workspace>) {
    this.logger.log(`AFTER ENTITY REMOVED: `, event.entity);
  }
}
