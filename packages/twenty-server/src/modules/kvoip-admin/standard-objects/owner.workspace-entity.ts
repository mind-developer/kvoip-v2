import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { OWNER_STANDARD_FIELD_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-field-ids.constant';
import { KVOIP_ADMIN_STANDARD_OBJECT_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-ids.constant';
import { KVOIP_ADMIN_STANRD_BOJECT_ICONS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-object-icons.constant';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { EmailsMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/emails.composite-type';
import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { PhonesMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SubscriptionWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/subscription.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/tenant.workspace-entity';

const NAME_FIELD_NAME = 'name';
const EMAILS_FIELD_NAME = 'emails';

export const SEARCH_FIELDS_FOR_PERSON: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.FULL_NAME },
  { name: EMAILS_FIELD_NAME, type: FieldMetadataType.EMAILS },
];

@WorkspaceEntity({
  standardId: KVOIP_ADMIN_STANDARD_OBJECT_IDS.owner,
  namePlural: 'owners',
  labelSingular: msg`Owner`,
  labelPlural: msg`Owner`,
  description: msg`The person who is responsible for managing the workspace and its resources.`,
  icon: KVOIP_ADMIN_STANRD_BOJECT_ICONS.owner,
  shortcut: 'P',
  labelIdentifierStandardId: OWNER_STANDARD_FIELD_IDS.name,
  imageIdentifierStandardId: OWNER_STANDARD_FIELD_IDS.avatarUrl,
})
@WorkspaceDuplicateCriteria([
  ['nameFirstName', 'nameLastName'],
  ['emailsPrimaryEmail'],
])
@WorkspaceIsSearchable()
export class OwnerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.FULL_NAME,
    label: msg`Name`,
    description: msg`Contact’s name`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  name: FullNameMetadata | null;

  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.userId,
    type: FieldMetadataType.TEXT,
    label: msg`User Id`,
    description: msg`Associated User Id`,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  userId: string | null;

  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.emails,
    type: FieldMetadataType.EMAILS,
    label: msg`Emails`,
    description: msg`Contact’s Emails`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  @WorkspaceIsUnique()
  emails: EmailsMetadata | null;

  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.phone,
    type: FieldMetadataType.TEXT,
    label: msg`Phone`,
    description: msg`Contact’s phone number`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  phone: string | null;

  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.phones,
    type: FieldMetadataType.PHONES,
    label: msg`Phones`,
    description: msg`Contact’s phone numbers`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  phones: PhonesMetadata | null;

  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.city,
    type: FieldMetadataType.TEXT,
    label: msg`City`,
    description: msg`Contact’s city`,
    icon: 'IconMap',
  })
  @WorkspaceIsNullable()
  city: string | null;

  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Avatar`,
    description: msg`Contact’s avatar`,
    icon: 'IconFileUpload',
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  avatarUrl: string | null;

  @WorkspaceRelation({
    standardId: OWNER_STANDARD_FIELD_IDS.workspaces,
    type: RelationType.ONE_TO_MANY,
    label: msg`Workspaces`,
    description: msg`Workspaces linked to the person.`,
    icon: 'IconFileImport',
    inverseSideTarget: () => TenantWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  workspaces: Relation<TenantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OWNER_STANDARD_FIELD_IDS.subscriptions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Subscriptions`,
    description: msg`Subscriptions linked to the owner.`,
    icon: 'IconFileImport',
    inverseSideTarget: () => SubscriptionWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  subscriptions: Relation<SubscriptionWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Person record Position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: OWNER_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_PERSON,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
