import { msg } from "@lingui/core/macro";
import { SEARCH_VECTOR_FIELD } from "src/engine/metadata-modules/constants/search-vector-field.constants";
import { RichTextV2Metadata } from "src/engine/metadata-modules/field-metadata/composite-types/rich-text-v2.composite-type";
import { IndexType } from "src/engine/metadata-modules/index-metadata/index-metadata.entity";
import { BaseWorkspaceEntity } from "src/engine/twenty-orm/base.workspace-entity";
import { WorkspaceEntity } from "src/engine/twenty-orm/decorators/workspace-entity.decorator";
import { WorkspaceFieldIndex } from "src/engine/twenty-orm/decorators/workspace-field-index.decorator";
import { WorkspaceField } from "src/engine/twenty-orm/decorators/workspace-field.decorator";
import { WorkspaceIsNullable } from "src/engine/twenty-orm/decorators/workspace-is-nullable.decorator";
import { WorkspaceIsSystem } from "src/engine/twenty-orm/decorators/workspace-is-system.decorator";
import { RECORD_COMMENT_STANDARD_FIELD_IDS } from "src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids";
import { STANDARD_OBJECT_IDS } from "src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids";
import { FieldMetadataType } from 'twenty-shared/types';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.recordComment,
  namePlural: 'recordComments',
  labelSingular: msg`Record Comment`,
  labelPlural: msg`Record Comments`,
  icon: 'IconMessageCircle',
  labelIdentifierStandardId: RECORD_COMMENT_STANDARD_FIELD_IDS.title,
})

export class RecordCommentWorkspaceEntity extends BaseWorkspaceEntity {
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
    type: FieldMetadataType.RICH_TEXT_V2,
    icon: "IconBlockquote"
  })
  @WorkspaceIsNullable()
  body: RichTextV2Metadata | null;

  @WorkspaceField({
    standardId: RECORD_COMMENT_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
