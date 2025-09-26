import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CHATBOT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { WhatsappWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';

export enum ChatbotStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

const ChatbotStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: ChatbotStatus.DRAFT,
    label: 'Draft',
    position: 0,
    color: 'yellow',
  },
  {
    value: ChatbotStatus.ACTIVE,
    label: 'Active',
    position: 1,
    color: 'green',
  },
  {
    value: ChatbotStatus.DEACTIVATED,
    label: 'Deactivated',
    position: 2,
    color: 'gray',
  },
];

registerEnumType(ChatbotStatus, {
  name: 'ChatbotStatus',
  description: 'Chatbot status options',
});

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CHATBOT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.chatbot,
  namePlural: 'chatbots',
  labelSingular: msg`Chatbot`,
  labelPlural: msg`Chatbots`,
  description: msg`A chatbot`,
  icon: STANDARD_OBJECT_ICONS.chatbot,
  labelIdentifierStandardId: CHATBOT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
@ObjectType()
export class ChatbotWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The chatbot's name`,
    icon: 'IconRobot',
  })
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`The current status of the chatbot flow`,
    icon: 'IconStatusChange',
    options: ChatbotStatusOptions,
  })
  @WorkspaceIsNullable()
  status: ChatbotStatus | null;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Chatbot record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: CHATBOT_STANDARD_FIELD_IDS.integrationId,
    type: RelationType.ONE_TO_MANY,
    label: msg`Integrations`,
    description: msg`Integration linked to the charge`,
    icon: 'IconBrandStackshare',
    //TODO: this should be platform-agnostic
    inverseSideTarget: () => WhatsappWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  //TODO: this should be platform-agnostic
  integrationId: Relation<WhatsappWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.nodes,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Nodes`,
    icon: 'IconBrandStackshare',
    description: msg`Flow nodes`,
  })
  @WorkspaceIsNullable()
  nodes: any[];

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.edges,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Edges`,
    icon: 'IconGizmo',
    description: msg`Flow edges`,
  })
  @WorkspaceIsNullable()
  edges: any[];

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.viewport,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Viewport Position`,
    icon: 'IconMathXy',
    description: msg`Last saved viewport position`,
  })
  viewport: { [key: string]: any };

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_CHATBOT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
