import { msg } from "@lingui/core/macro";
import { SEARCH_VECTOR_FIELD } from "src/engine/metadata-modules/constants/search-vector-field.constants";
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
import { TimelineActivityWorkspaceEntity } from "src/modules/timeline/standard-objects/timeline-activity.workspace-entity";
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from "typeorm";

const TITLE_FIELD_NAME = 'title';
const BODY_FIELD_NAME = 'body';

export const SEARCH_FIELDS_FOR_RECORD_COMMENT: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: BODY_FIELD_NAME, type: FieldMetadataType.TEXT },
];
@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.recordComment,
  namePlural: 'recordComments',
  labelSingular: msg`Record Comment`,
  labelPlural: msg`Record Comments`,
  icon: 'IconMessageCircle',
  labelIdentifierStandardId: RECORD_COMMENT_STANDARD_FIELD_IDS.title,
})

@WorkspaceIsSearchable()
@WorkspaceIsNotAuditLogged()
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
    label: msg`Comment title`,
    type: FieldMetadataType.TEXT,
    icon: 'IconPencil',
  })
  @WorkspaceIsNullable()
  title: string | null;

  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.body,
    label: msg`Comment body`,
    type: FieldMetadataType.TEXT,
    icon: "IconBlockquote"
  })
  @WorkspaceIsNullable()
  body: string | null;

  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.createdBy,
    label: msg`Comment body`,
    type: FieldMetadataType.ACTOR,
    icon: "IconUser"
  })
  createdBy: string;

  @WorkspaceRelation({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the record comment.`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_RECORD_COMMENT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
