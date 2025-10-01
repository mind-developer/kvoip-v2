import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { INBOX_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';
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
  icon: 'IconUsers',
  labelIdentifierStandardId: INBOX_FIELD_IDS.name,
})
@WorkspaceIsSystem()
export class InboxWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: INBOX_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: msg`Icon`,
    description: msg`Inbox icon`,
    icon: 'IconPencil',
  })
  icon: string;

  @WorkspaceField({
    standardId: INBOX_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Inbox name`,
    icon: 'IconPencil',
  })
  name: string;

  @WorkspaceRelation({
    standardId: INBOX_FIELD_IDS.inboxTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Inbox Targets`,
    description: msg`Inbox targets`,
    icon: 'IconArrowUpRight',
    inverseSideTarget: () => InboxTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  inboxTargets: Relation<InboxTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: INBOX_FIELD_IDS.whatsappIntegration,
    type: RelationType.ONE_TO_MANY,
    label: msg`WhatsApp integration`,
    description: msg`WhatsApp account assigned to this inbox`,
    icon: 'IconBrandWhatsapp',
    inverseSideTarget: () => WhatsappIntegrationWorkspaceEntity,
  })
  @WorkspaceIsNullable()
  whatsappIntegration: Relation<WhatsappIntegrationWorkspaceEntity>;
  // add more integrations here when necessary. one inbox can hold multiple chat providers

  @WorkspaceRelation({
    standardId: INBOX_FIELD_IDS.chatbot,
    type: RelationType.MANY_TO_ONE,
    label: msg`Inboxes`,
    description: msg`Chatbots assigned to this agent`,
    icon: 'IconInbox',
    inverseSideTarget: () => ChatbotWorkspaceEntity,
    inverseSideFieldKey: 'inboxes',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  chatbot: Relation<ChatbotWorkspaceEntity> | null;

  @WorkspaceJoinColumn('chatbot')
  chatbotId: string | null;
}
