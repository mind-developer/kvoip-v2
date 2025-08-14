/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/workspaces/standard-objects/tenant.workspace-entity';

@Injectable()
export class UpdateWorkspacesMebersCountListener {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  async handleCreateOrDeleteEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    const tenantRepository =
      await this.twentyORMManager.getRepository<TenantWorkspaceEntity>(
        'tenant',
      );

    const workspace = await tenantRepository.findOne({
      where: {
        coreWorkspaceId: payload.workspaceId,
      },
    });

    if (!isDefined(workspace)) return;

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
        payload.workspaceId,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const workspaceMembersCount = await workspaceMemberRepository.count();

    if (!workspaceMembersCount || workspaceMembersCount <= 0) {
      return;
    }

    await tenantRepository.update(workspace.id, {
      membersCount: workspaceMembersCount,
    });
  }
}
