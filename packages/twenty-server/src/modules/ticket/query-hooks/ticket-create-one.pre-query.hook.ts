import { isDefined } from 'class-validator';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
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
  closedBy?: ActorMetadata | null;
  lastUpdatedBy?: ActorMetadata;
};

@WorkspaceQueryHook('ticket.createOne')
export class TicketCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateOneResolverArgs<UpdateData>,
  ): Promise<CreateOneResolverArgs<UpdateData>> {
    if (!isDefined(payload.data)) {
      throw new GraphqlQueryRunnerException(
        'Payload data is required',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const { workspace, workspaceMemberId } = authContext;
    workspaceValidator.assertIsDefinedOrThrow(workspace);

    if (!workspaceMemberId) return payload;

    const workspaceMember = await this.findWorkspaceMember(
      workspace.id,
      workspaceMemberId,
    );

    return {
      ...payload,
      data: {
        ...payload.data,
        lastUpdatedBy: this.buildActorMetadata(workspaceMember),
        closedBy: this.buildActorMetadata(workspaceMember, true),
      },
    };
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
    isNull: boolean = false,
  ): ActorMetadata {
    const { firstName, lastName } = workspaceMember.name;
    if (isNull) {
      return {
        workspaceMemberId: null,
        source: FieldActorSource.MANUAL,
        name: '',
        context: {},
      };
    }
    return {
      workspaceMemberId: workspaceMember.id,
      source: FieldActorSource.MANUAL,
      name: `${firstName} ${lastName}`,
      context: {},
    };
  }
}
