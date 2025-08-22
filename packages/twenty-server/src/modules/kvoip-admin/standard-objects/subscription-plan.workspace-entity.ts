import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-field-ids.constant';
import { KVOIP_ADMIN_STANDARD_OBJECT_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-ids.constant';
import { KVOIP_ADMIN_STANRD_BOJECT_ICONS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-object-icons.constant';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SubscriptionWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/subscriptions.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WORKSPACES: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

const subscriptionKeyOptions: FieldMetadataComplexOption[] = [
  {
    value: BillingPlanKey.PRO,
    label: 'Pro',
    position: 0,
    color: 'blue',
  },
  {
    value: BillingPlanKey.ENTERPRISE,
    label: 'Enterprise',
    position: 0,
    color: 'blue',
  },
];

enum SubscriptionPlanStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

const subscriptionPlanStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: SubscriptionPlanStatus.Active,
    label: 'Ativa',
    position: 0,
    color: 'green',
  },
  {
    value: SubscriptionPlanStatus.Inactive,
    label: 'Inativo',
    position: 1,
    color: 'red',
  },
];

@WorkspaceEntity({
  standardId: KVOIP_ADMIN_STANDARD_OBJECT_IDS.subscriptionPlan,
  namePlural: 'subscriptionPlans',
  labelSingular: msg`SubscriptionPlan plan`,
  labelPlural: msg`SubscriptionPlan plans`,
  description: msg`All subscription plans`,
  icon: KVOIP_ADMIN_STANRD_BOJECT_ICONS.subscriptionPlan,
  labelIdentifierStandardId: SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
@WorkspaceIsSystem()
export class SubscriptionPlanWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Identifier`,
    description: msg`The unique indentifier code for the subscription`,
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @WorkspaceField({
    standardId: SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS.planKey,
    type: FieldMetadataType.MULTI_SELECT,
    label: msg`Recurrence`,
    description: msg`Number of members in the workspace`,
    icon: 'IconUsers',
    options: subscriptionKeyOptions,
  })
  @WorkspaceIsNullable()
  planKey: BillingPlanKey | null;

  @WorkspaceField({
    standardId: SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.MULTI_SELECT,
    label: msg`Recurrence`,
    description: msg`Number of members in the workspace`,
    icon: 'IconUsers',
    options: subscriptionPlanStatusOptions,
  })
  @WorkspaceIsNullable()
  status: SubscriptionPlanStatus | null;

  @WorkspaceRelation({
    standardId: SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS.subscriptions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Subscription`,
    description: msg`The workspace subscription plan`,
    icon: 'IconMoneybag',
    inverseSideTarget: () => SubscriptionWorkspaceEntity,
    inverseSideFieldKey: 'subscriptionPlan',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  subscriptions: Relation<SubscriptionWorkspaceEntity[]> | null;

  @WorkspaceField({
    standardId: SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Subscription record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS.searchVector,
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
