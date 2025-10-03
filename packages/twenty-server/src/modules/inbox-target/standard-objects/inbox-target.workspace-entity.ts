import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { INBOX_TARGET_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { InboxWorkspaceEntity } from 'src/modules/inbox/standard-objects/inbox.workspace-entity';
import { RelationType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.inboxTarget,
  namePlural: 'inboxTargets',
  labelSingular: msg`Inbox Target`,
  labelPlural: msg`Inbox Targets`,
  icon: 'IconArrowUpRight',
})
@WorkspaceIsSystem()
export class InboxTargetWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: INBOX_TARGET_FIELD_IDS.inbox,
    type: RelationType.MANY_TO_ONE,
    label: msg`Inboxes`,
    description: msg`Inboxes assigned to this agent`,
    inverseSideTarget: () => InboxWorkspaceEntity,
    inverseSideFieldKey: 'inboxTargets',
  })
  @WorkspaceIsNullable()
  inbox: Relation<InboxWorkspaceEntity> | null;

  @WorkspaceJoinColumn('inbox')
  inboxId: string | null;

  @WorkspaceRelation({
    standardId: INBOX_TARGET_FIELD_IDS.agent,
    type: RelationType.MANY_TO_ONE,
    label: msg`Agents`,
    description: msg`Agents related to this inbox target`,
    inverseSideTarget: () => AgentWorkspaceEntity,
    inverseSideFieldKey: 'inboxTargets',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  agent: Relation<AgentWorkspaceEntity> | null;

  @WorkspaceJoinColumn('agent')
  agentId: string | null;
}
