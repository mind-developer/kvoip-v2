import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { AGENT_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { RelationType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.agent,
  namePlural: 'agents',
  labelSingular: msg`Agent`,
  labelPlural: msg`Agents`,
  description: msg`Agents on this Workspace`,
  icon: 'IconUsers',
})
@WorkspaceIsSearchable()
export class AgentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: AGENT_FIELD_IDS.sector,
    type: RelationType.MANY_TO_ONE,
    label: msg`Sector`,
    description: msg`Sector assigned to this agent`,
    icon: 'IconIdBadge2',
    inverseSideTarget: () => SectorWorkspaceEntity,
    inverseSideFieldKey: 'agents',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  sector: Relation<SectorWorkspaceEntity | null>;

  @WorkspaceJoinColumn('sector')
  sectorId: string | null;

  @WorkspaceRelation({
    standardId: AGENT_FIELD_IDS.workspaceMember,
    type: RelationType.ONE_TO_MANY,
    label: msg`Workspace Member`,
    description: msg`Workspace member assigned to this agent`,
    icon: 'IconUsers',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: AGENT_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Agent timeline activities`,
    icon: 'IconArrowUpRight',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]> | null;

  @WorkspaceRelation({
    standardId: AGENT_FIELD_IDS.chats,
    type: RelationType.ONE_TO_MANY,
    label: msg`Agent chats`,
    icon: 'IconChat',
    inverseSideTarget: () => ClientChatWorkspaceEntity,
    inverseSideFieldKey: 'agent',
  })
  chats: Relation<ClientChatWorkspaceEntity[]> | null;
}
