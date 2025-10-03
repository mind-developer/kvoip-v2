import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { INBOX_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { InboxTargetWorkspaceEntity } from 'src/modules/inbox-target/standard-objects/inbox-target.workspace-entity';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.inbox,
  namePlural: 'inboxes',
  labelSingular: msg`inbox`,
  labelPlural: msg`inboxes`,
  description: msg`inboxes on this Workspace`,
})
@WorkspaceIsSystem()
export class InboxWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: INBOX_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Inbox name`,
  })
  name: string;

  @WorkspaceField({
    standardId: INBOX_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: msg`Icon`,
    description: msg`Inbox icon`,
  })
  icon: string;

  @WorkspaceRelation({
    standardId: INBOX_FIELD_IDS.inboxTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Inbox Targets`,
    description: msg`Inbox targets`,
    inverseSideTarget: () => InboxTargetWorkspaceEntity,
    inverseSideFieldKey: 'inbox',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  inboxTargets: Relation<InboxTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: INBOX_FIELD_IDS.whatsappIntegration,
    type: RelationType.MANY_TO_ONE,
    label: msg`WhatsApp integration`,
    description: msg`WhatsApp integration assigned to this inbox (1:1 relation)`,
    inverseSideTarget: () => WhatsappIntegrationWorkspaceEntity,
    inverseSideFieldKey: 'inbox',
  })
  @WorkspaceIsNullable()
  whatsappIntegration: Relation<WhatsappIntegrationWorkspaceEntity> | null;

  @WorkspaceJoinColumn('whatsappIntegration')
  whatsappIntegrationId: string | null;
  // add more integrations here when necessary. one inbox can hold one integration per provider
}
