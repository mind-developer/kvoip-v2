/* @kvoip-woulz proprietary:begin */
import { Logger } from '@nestjs/common';
import { isDefined } from 'class-validator';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TicketStatus } from 'src/modules/ticket/ticket.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type UpdateData = {
  statuses?: TicketStatus | null;
  closedBy?: ActorMetadata;
  lastUpdatedBy?: ActorMetadata;
};

@WorkspaceQueryHook('ticket.updateOne')
export class TicketUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(TicketUpdateOnePreQueryHook.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: UpdateOneResolverArgs<UpdateData>,
  ): Promise<UpdateOneResolverArgs<UpdateData>> {
    if (!isDefined(payload.data)) {
      throw new GraphqlQueryRunnerException(
        'Payload data is required',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const { workspace, workspaceMemberId } = authContext;
    workspaceValidator.assertIsDefinedOrThrow(workspace);

    if (!workspaceMemberId) return payload;

    const updatedData = {
      ...payload,
      data: {
        ...payload.data,
      },
    };

    const isEnding = payload.data.statuses === TicketStatus.DEACTIVATED;

    const workspaceMember = await this.findWorkspaceMember(
      workspace.id,
      workspaceMemberId,
    );

    if (isEnding) {
      updatedData.data.closedBy = this.buildActorMetadata(workspaceMember);
    }
    updatedData.data.lastUpdatedBy = this.buildActorMetadata(workspaceMember);

    return updatedData;
  }

  private async findWorkspaceMember(
    workspaceId: any,
    workspaceMemberId: any,
  ): Promise<WorkspaceMemberWorkspaceEntity> {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    return await workspaceMemberRepository.findOneOrFail({
      where: {
        id: workspaceMemberId,
      },
    });
  }

  private buildActorMetadata(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
  ): ActorMetadata {
    const { firstName, lastName } = workspaceMember.name;
    return {
      workspaceMemberId: workspaceMember.id,
      source: FieldActorSource.MANUAL,
      name: `${firstName} ${lastName}`,
      context: {},
    };
  }
}
/* @kvoip-woulz proprietary:end */
