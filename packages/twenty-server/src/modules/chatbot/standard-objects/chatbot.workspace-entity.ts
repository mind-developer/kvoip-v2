import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CHATBOT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.chatbot,
  namePlural: 'chatbots',
  labelSingular: msg`Chatbot`,
  labelPlural: msg`Chatbots`,
  description: msg`A chatbot`,
})
export class ChatbotWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The chatbot's name`,
  })
  name: string | null;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.TEXT,
    label: msg`Status`,
    description: msg`The current status of the chatbot flow`,
    icon: 'IconStatusChange',
  })
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED';

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.nodes,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Nodes`,
  })
  @WorkspaceIsNullable()
  flowNodes: any[];

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.edges,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Edges`,
  })
  @WorkspaceIsNullable()
  flowEdges: any[];

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.viewport,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Viewport Position`,
  })
  @WorkspaceIsNullable()
  viewport: { [key: string]: any } | null;

  @WorkspaceRelation({
    standardId: CHATBOT_STANDARD_FIELD_IDS.whatsappIntegrations,
    type: RelationType.ONE_TO_MANY,
    label: msg`Whatsapp Integrations`,
    inverseSideTarget: () => WhatsappIntegrationWorkspaceEntity,
  })
  @WorkspaceIsNullable()
  whatsappIntegrations: Relation<WhatsappIntegrationWorkspaceEntity[]> | null;

  @WorkspaceRelation({
    standardId: CHATBOT_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the chatbot`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]> | null;

  @WorkspaceRelation({
    standardId: CHATBOT_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the chatbot`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]> | null;
}
