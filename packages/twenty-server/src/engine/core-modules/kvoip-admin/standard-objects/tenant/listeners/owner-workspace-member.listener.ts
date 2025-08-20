/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { OwnerService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/owner.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/workspaces/standard-objects/tenant.workspace-entity';

@Injectable()
export class OwnerWorkspaceMemberListener {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly ownerService: OwnerService,
  ) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.UPDATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  async handleCreateOrDeleteEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    const adminWorkspace = await this.ownerService.kvoipAdminWorkspaceExists();

    if (!isDefined(adminWorkspace)) return;

    const tenantRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TenantWorkspaceEntity>(
        adminWorkspace.id,
        'tenant',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const tenant = await tenantRepository.findOne({
      where: {
        coreWorkspaceId: payload.workspaceId,
      },
    });

    if (!isDefined(tenant)) return;

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        payload.workspaceId,
        'workspaceMember',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const workspaceMembersCount = await workspaceMemberRepository.count();

    await tenantRepository.update(tenant.id, {
      membersCount: workspaceMembersCount,
    });

    if (isDefined(adminWorkspace)) {
      const ownerWorkspaceMmberPayloadEvent = payload.events.find(
        (event) =>
          event.properties.after.userEmail === adminWorkspace.creatorEmail,
      );

      if (isDefined(ownerWorkspaceMmberPayloadEvent)) {
        await this.ownerService.handleOwnerWorkspaceMemberUpsert({
          userId: ownerWorkspaceMmberPayloadEvent.properties.after.userId,
          workspaceId: payload.workspaceId,
        });
      }
    }
  }
}
