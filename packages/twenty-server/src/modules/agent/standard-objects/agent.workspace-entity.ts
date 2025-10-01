import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { AGENT_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { InboxTargetWorkspaceEntity } from 'src/modules/inbox-target/standard-objects/inbox-target.workspace-entity';
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
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
  @WorkspaceField({
    standardId: AGENT_FIELD_IDS.isAdmin,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Administrator`,
    description: msg`Whether this agent has administrator privileges`,
    icon: 'IconBriefcase',
  })
  isAdmin: string;

  @WorkspaceField({
    standardId: AGENT_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Active`,
    description: msg`Whether this agent is active`,
    icon: 'IconPlayerRecord',
  })
  isActive: string;

  @WorkspaceRelation({
    standardId: AGENT_FIELD_IDS.sector,
    type: RelationType.MANY_TO_ONE,
    label: msg`Sector`,
    description: msg`Sector assigned to this agent`,
    icon: 'IconIdBadge2',
    inverseSideTarget: () => SectorWorkspaceEntity,
    inverseSideFieldKey: 'agents',
  })
  @WorkspaceIsNullable()
  sector: Relation<SectorWorkspaceEntity>;

  @WorkspaceJoinColumn('sector')
  sectorId: string;

  @WorkspaceRelation({
    standardId: AGENT_FIELD_IDS.inboxTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Inbox Targets`,
    description: msg`Inbox targets assigned to this agent`,
    icon: 'IconInbox',
    inverseSideTarget: () => InboxTargetWorkspaceEntity,
  })
  @WorkspaceIsNullable()
  inboxTargets: Relation<InboxTargetWorkspaceEntity[]> | null;

  @WorkspaceRelation({
    standardId: AGENT_FIELD_IDS.workspaceMember,
    type: RelationType.ONE_TO_MANY,
    label: msg`Workspace Member`,
    description: msg`Workspace member assigned to this sector`,
    icon: 'IconUsers',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
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
}
