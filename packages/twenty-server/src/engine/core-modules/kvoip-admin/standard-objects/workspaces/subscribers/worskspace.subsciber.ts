import { Injectable, Logger } from '@nestjs/common';
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

import { WorkspacesService } from 'src/engine/core-modules/kvoip-admin/standard-objects/workspaces/services/workspaces.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@EventSubscriber()
@Injectable()
export class WorkspaceSubscriber
  implements EntitySubscriberInterface<Workspace>
{
  private readonly logger = new Logger(WorkspaceSubscriber.name);

  constructor(
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
    private readonly workspacesService: WorkspacesService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return Workspace;
  }

  async afterInsert(event: InsertEvent<Workspace>) {
    await this.workspacesService.handleWorkspaceUpsert(event.entity);
  }

  async afterUpdate(event: UpdateEvent<Workspace>) {
    this.logger.log(`AFTER ENTITY UPDATED: `, event.entity);
  }

  async afterRemove(event: RemoveEvent<Workspace>) {
    if (isDefined(event.entity)) {
      await this.workspacesService.handleWorkspaceDelete(event.entity.id);
    }
  }
}
