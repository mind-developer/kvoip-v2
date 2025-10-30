import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CHATBOT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { Relation } from 'typeorm';
import { ObjectType } from '@nestjs/graphql';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.chatbot,
  namePlural: 'chatbots',
  labelSingular: msg`Chatbot`,
  labelPlural: msg`Chatbots`,
  description: msg`A chatbot`,
})
@WorkspaceIsSystem()
@ObjectType()
export class ChatbotWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The chatbot's name`,
  })
  @WorkspaceIsUnique()
  name: string;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.TEXT,
    label: msg`Status`,
    description: msg`The current status of the chatbot flow`,
  })
  @WorkspaceIsNullable()
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED' | null;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.nodes,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Nodes`,
  })
  @WorkspaceIsNullable()
  nodes: any[];

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.edges,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Edges`,
  })
  @WorkspaceIsNullable()
  edges: any[];

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
    inverseSideFieldKey: 'chatbot',
  })
  whatsappIntegrations: Relation<WhatsappIntegrationWorkspaceEntity[]> | null;
}
