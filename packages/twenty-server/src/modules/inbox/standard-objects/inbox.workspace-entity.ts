import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { INBOX_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { ChatIntegrationWorkspaceEntity } from 'src/modules/chat-integration/standard-objects/chat-integration.workspace-entity';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.inbox,
  namePlural: 'inboxes',
  labelSingular: msg`inbox`,
  labelPlural: msg`inboxes`,
  description: msg`inboxes on this Workspace`,
  icon: 'IconUsers',
  labelIdentifierStandardId: INBOX_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class InboxWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: INBOX_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Inbox name`,
    icon: 'IconPencil',
  })
  name: string;

  @WorkspaceRelation({
    standardId: INBOX_FIELD_IDS.agent,
    type: RelationType.MANY_TO_ONE,
    label: msg`Agent`,
    description: msg`Agent assigned to this inbox`,
    icon: 'IconUsers',
    inverseSideTarget: () => AgentWorkspaceEntity,
    inverseSideFieldKey: 'inboxes',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  agents: Relation<AgentWorkspaceEntity[]>;

  @WorkspaceJoinColumn('agents')
  agentId: string | null;

  @WorkspaceRelation({
    standardId: INBOX_FIELD_IDS.chatIntegrations,
    type: RelationType.ONE_TO_MANY,
    label: msg`Chat Integration`,
    description: msg`Chat Integration`,
    icon: 'IconLine',
    inverseSideTarget: () => ChatIntegrationWorkspaceEntity,
  })
  chatIntegrations: Relation<ChatIntegrationWorkspaceEntity[]>;
}
