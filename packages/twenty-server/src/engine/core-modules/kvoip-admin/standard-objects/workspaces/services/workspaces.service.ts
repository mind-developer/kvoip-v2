import { Injectable } from '@nestjs/common';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspacesWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/workspaces-entity';

@Injectable()
export class WorkspacesService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async handleWorkspaceUpsert(workspace: Workspace) {
    const workspacesRepository =
      await this.twentyORMManager.getRepository<WorkspacesWorkspaceEntity>(
        'workspaces',
      );
  }

  async handleWorkspaceDelete(workspaceId: string) {}
}
