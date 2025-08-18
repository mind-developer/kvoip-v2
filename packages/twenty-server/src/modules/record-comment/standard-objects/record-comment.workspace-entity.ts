import { msg } from "@lingui/core/macro";
import { SEARCH_VECTOR_FIELD } from "src/engine/metadata-modules/constants/search-vector-field.constants";
import { RichTextV2Metadata } from "src/engine/metadata-modules/field-metadata/composite-types/rich-text-v2.composite-type";
import { RelationType } from "src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface";
import { IndexType } from "src/engine/metadata-modules/index-metadata/index-metadata.entity";
import { RelationOnDeleteAction } from "src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type";
import { BaseWorkspaceEntity } from "src/engine/twenty-orm/base.workspace-entity";
import { WorkspaceEntity } from "src/engine/twenty-orm/decorators/workspace-entity.decorator";
import { WorkspaceFieldIndex } from "src/engine/twenty-orm/decorators/workspace-field-index.decorator";
import { WorkspaceField } from "src/engine/twenty-orm/decorators/workspace-field.decorator";
import { WorkspaceIsNotAuditLogged } from "src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator";
import { WorkspaceIsNullable } from "src/engine/twenty-orm/decorators/workspace-is-nullable.decorator";
import { WorkspaceIsSearchable } from "src/engine/twenty-orm/decorators/workspace-is-searchable.decorator";
import { WorkspaceIsSystem } from "src/engine/twenty-orm/decorators/workspace-is-system.decorator";
import { WorkspaceRelation } from "src/engine/twenty-orm/decorators/workspace-relation.decorator";
import { RECORD_COMMENT_STANDARD_FIELD_IDS } from "src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids";
import { STANDARD_OBJECT_IDS } from "src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids";
import { FieldTypeAndNameMetadata, getTsVectorColumnExpressionFromFields } from "src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util";
import { PersonWorkspaceEntity } from "src/modules/person/standard-objects/person.workspace-entity";
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from "typeorm";

const TITLE_FIELD_NAME = 'title';
const BODY_V2_FIELD_NAME = 'bodyV2';

export const SEARCH_FIELDS_FOR_NOTES: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: BODY_V2_FIELD_NAME, type: FieldMetadataType.RICH_TEXT_V2 },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.recordComment,
  namePlural: 'recordComments',
  labelSingular: msg`Comment`,
  labelPlural: msg`Comments`,
  icon: 'IconMessageCircle',
  labelIdentifierStandardId: RECORD_COMMENT_STANDARD_FIELD_IDS.title,
})
@WorkspaceIsSearchable()
export class RecordCommentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Record comment position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.title,
    label: msg`Title`,
    type: FieldMetadataType.TEXT,
    icon: 'IconPencil',
  })
  @WorkspaceIsNullable()
  title: string | null;

  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.bodyV2,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Body`,
    description: msg`Comment body`,
    icon: 'IconBlockquote',
  })
  @WorkspaceIsNullable()
  bodyV2: RichTextV2Metadata | null;

  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.createdBy,
    label: msg`Comment creator`,
    type: FieldMetadataType.ACTOR,
    icon: "IconUser"
  })
  createdBy: string;

  @WorkspaceRelation({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.people,
    label: msg`People`,
    description: msg`People tied to this comment`,
    icon: 'IconFileImport',
    type: RelationType.ONE_TO_MANY,
    inverseSideTarget: () => PersonWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  people: Relation<PersonWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_NOTES,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
