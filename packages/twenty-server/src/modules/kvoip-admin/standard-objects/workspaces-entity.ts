import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { WORKSPACES_STANDARD_FIELD_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-field-ids.constant';
import { KVOIP_ADMIN_STANDARD_OBJECT_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-ids.constant';
import { KVOIP_ADMIN_STANRD_BOJECT_ICONS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-object-icons.constant';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { OwnerWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/owner-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WORKSPACES: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: KVOIP_ADMIN_STANDARD_OBJECT_IDS.workspaces,
  namePlural: 'workspaces',
  labelSingular: msg`Workspaces`,
  labelPlural: msg`Workspaces`,
  description: msg`All Workspaces`,
  icon: KVOIP_ADMIN_STANRD_BOJECT_ICONS.workspaces,
  shortcut: 'C',
  labelIdentifierStandardId: WORKSPACES_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
@WorkspaceIsSearchable()
export class WorkspacesWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKSPACES_STANDARD_FIELD_IDS.coreWorkspaceId,
    type: FieldMetadataType.UUID,
    label: msg`Core schema workspace id`,
    description: msg`The workspace id from the core schema.`,
  })
  @WorkspaceIsSystem()
  @WorkspaceIsUnique()
  coreWorkspaceId: string;

  @WorkspaceField({
    standardId: WORKSPACES_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The workspace name`,
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @WorkspaceField({
    standardId: WORKSPACES_STANDARD_FIELD_IDS.ownerEmail,
    type: FieldMetadataType.TEXT,
    label: msg`Workspace owner primary e-mail`,
    description: msg`The workspace woner primary email.`,
    icon: 'IconLink',
  })
  ownerEmail: string;

  @WorkspaceField({
    standardId: WORKSPACES_STANDARD_FIELD_IDS.membersCount,
    type: FieldMetadataType.NUMBER,
    label: msg`Nº Members`,
    description: msg`Number of members in the workspace`,
    icon: 'IconUsers',
    defaultValue: 1,
  })
  @WorkspaceIsNullable()
  membersCount: number | null;

  @WorkspaceField({
    standardId: WORKSPACES_STANDARD_FIELD_IDS.extentionsCount,
    type: FieldMetadataType.NUMBER,
    label: msg`Nº Extentions`,
    description: msg`Number of extentions in the workspace`,
    icon: 'IconUsers',
    defaultValue: 1,
  })
  @WorkspaceIsNullable()
  extentionsCount: number | null;

  @WorkspaceRelation({
    standardId: WORKSPACES_STANDARD_FIELD_IDS.owner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Owner`,
    description: msg`Workspace owner`,
    icon: 'IconUser',
    inverseSideTarget: () => OwnerWorkspaceEntity,
    inverseSideFieldKey: 'workspaces',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  owner: Relation<OwnerWorkspaceEntity> | null;

  @WorkspaceJoinColumn('owner')
  ownerId: string | null;

  @WorkspaceField({
    standardId: WORKSPACES_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Person record Position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: WORKSPACES_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_WORKSPACES,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
