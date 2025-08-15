import { msg } from '@lingui/core/macro';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { COMMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadataType } from 'twenty-shared/types';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.comment,
  namePlural: 'comments',
  labelSingular: msg`Comments`,
  labelPlural: msg`Comment`,
  description: msg`A comment`,
  icon: 'IconMessageCircle',
  labelIdentifierStandardId: COMMENT_STANDARD_FIELD_IDS.text,
})
@WorkspaceIsSearchable()
export class CommentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: COMMENT_STANDARD_FIELD_IDS.text,
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`Comment title`,
  })
  commentTitle: string;

  @WorkspaceField({
    standardId: COMMENT_STANDARD_FIELD_IDS.body,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Body`,
    description: msg`Note body`,
  })
  commentBody: string;
}
