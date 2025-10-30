/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { OwnerService } from 'src/engine/core-modules/kvoip-admin/standard-objects/tenant/services/owner.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { TenantWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/tenant.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class OwnerWorkspaceMemberListener {
  private logger = new Logger(OwnerWorkspaceMemberListener.name);

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
    try {
      const adminWorkspace =
        await this.ownerService.kvoipAdminWorkspaceExists();

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
        const ownerWorkspaceMemberPayloadEvent = payload.events.find(
          (event) => event.properties.after.userEmail === tenant.ownerEmail,
        );

        if (isDefined(ownerWorkspaceMemberPayloadEvent)) {
          const member = await workspaceMemberRepository.findOneByOrFail({
            id: ownerWorkspaceMemberPayloadEvent.workspaceMemberId,
          });

          // TODO: Maybe remove this since we are going to use person instead of owner (confirm buisiness logic)
          await this.ownerService.handleOwnerWorkspaceMemberUpsert({
            userId: ownerWorkspaceMemberPayloadEvent.properties.after.userId,
            workspaceId: payload.workspaceId,
            member,
          });
        }

        for (const event of payload.events) {
          if (event.properties.after) {
            const member = await workspaceMemberRepository.findOneBy({
              id: event.workspaceMemberId,
            });

            if (isDefined(member)) {
              await this.ownerService.handleWorkspaceMemberPersonUpsert({
                workspaceId: payload.workspaceId,
                member,
              });
            }
          }
        }
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
