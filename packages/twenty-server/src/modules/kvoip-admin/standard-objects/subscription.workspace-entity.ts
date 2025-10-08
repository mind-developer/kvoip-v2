import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { SUBSCRIPTION_STANDARD_FIELD_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-field-ids.constant';
import { KVOIP_ADMIN_STANDARD_OBJECT_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-ids.constant';
import { KVOIP_ADMIN_STANRD_BOJECT_ICONS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-object-icons.constant';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsObjectUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-object-ui-readonly.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { OwnerWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/owner.workspace-entity';
import { SubscriptionPlanWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/subscription-plan.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/tenant.workspace-entity';

const NAME_FIELD_NAME = 'identifier';

export const SEARCH_FIELDS_FOR_WORKSPACES: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

const subscriptionPaymentProviderOptions: FieldMetadataComplexOption[] = [
  {
    value: BillingPaymentProviders.Stripe,
    label: 'Stripe',
    position: 0,
    color: 'green',
  },
  {
    value: BillingPaymentProviders.Inter,
    label: 'Inter',
    position: 0,
    color: 'orange',
  },
];

const subscriptionRecurrenceOptions: FieldMetadataComplexOption[] = [
  {
    value: SubscriptionInterval.Day,
    label: 'Diário',
    position: 0,
    color: 'gray',
  },
  {
    value: SubscriptionInterval.Week,
    label: 'Semanal',
    position: 1,
    color: 'gray',
  },
  {
    value: SubscriptionInterval.Month,
    label: 'Mensal',
    position: 2,
    color: 'gray',
  },
  {
    value: SubscriptionInterval.Year,
    label: 'Anual',
    position: 1,
    color: 'gray',
  },
];

const subscriptionStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: SubscriptionStatus.Active,
    label: 'Ativa',
    position: 0,
    color: 'green',
  },
  {
    value: SubscriptionStatus.Canceled,
    label: 'Cancelada',
    position: 1,
    color: 'red',
  },
  {
    value: SubscriptionStatus.Incomplete,
    label: 'Incompleta',
    position: 2,
    color: 'orange',
  },
  {
    value: SubscriptionStatus.IncompleteExpired,
    label: 'Incompleta Expirada',
    position: 3,
    color: 'red',
  },
  {
    value: SubscriptionStatus.PastDue,
    label: 'Pagamento Atrasado',
    position: 4,
    color: 'orange',
  },
  {
    value: SubscriptionStatus.Paused,
    label: 'Pausada',
    position: 5,
    color: 'gray',
  },
  {
    value: SubscriptionStatus.Trialing,
    label: 'Em Teste',
    position: 6,
    color: 'blue',
  },
  {
    value: SubscriptionStatus.Unpaid,
    label: 'Não Paga',
    position: 7,
    color: 'red',
  },
  {
    value: SubscriptionStatus.Expired,
    label: 'Expirada',
    position: 8,
    color: 'gray',
  },
];

@WorkspaceEntity({
  standardId: KVOIP_ADMIN_STANDARD_OBJECT_IDS.subscription,
  namePlural: 'subscriptions',
  labelSingular: msg`Subscription`,
  labelPlural: msg`Subscriptions`,
  description: msg`All Subscriptions`,
  icon: KVOIP_ADMIN_STANRD_BOJECT_ICONS.subscription,
  shortcut: 'S',
  labelIdentifierStandardId: SUBSCRIPTION_STANDARD_FIELD_IDS.identifier,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IS_KVOIP_ADMIN,
})
@WorkspaceIsObjectUIReadOnly()
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSearchable()
export class SubscriptionWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.identifier,
    type: FieldMetadataType.TEXT,
    label: msg`Identifier`,
    description: msg`The unique indentifier code for the subscription`,
    icon: 'IconBuildingSkyscraper',
  })
  identifier: string;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.paymentProvider,
    type: FieldMetadataType.SELECT,
    label: msg`Gateway`,
    description: msg`The payment gateway used for the subscription`,
    icon: 'IconMap',
    options: subscriptionPaymentProviderOptions,
  })
  @WorkspaceIsNullable()
  paymentProvider: BillingPaymentProviders | null;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.recurrence,
    type: FieldMetadataType.SELECT,
    label: msg`Recurrence`,
    description: msg`Number of members in the workspace`,
    icon: 'IconUsers',
    options: subscriptionRecurrenceOptions,
  })
  @WorkspaceIsNullable()
  recurrence: SubscriptionInterval | null;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`The subscription status`,
    icon: 'IconStatusChange',
    options: subscriptionStatusOptions,
  })
  @WorkspaceIsNullable()
  status: SubscriptionStatus | null;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.amount,
    type: FieldMetadataType.CURRENCY,
    label: msg`Value`,
    description: msg`The subscription price paid`,
    icon: 'IconMoneybag',
  })
  @WorkspaceIsNullable()
  amount: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.trialStart,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Trial Start`,
    description: msg`The subscription trial period start date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  trialStart: Date | null;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.trialEnd,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Trial End`,
    description: msg`The subscription trial period end date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  trialEnd: Date | null;

  @WorkspaceRelation({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.owner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Owner`,
    description: msg`Subscription workspace owner`,
    icon: 'IconUser',
    inverseSideTarget: () => OwnerWorkspaceEntity,
    inverseSideFieldKey: 'subscriptions',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  owner: Relation<OwnerWorkspaceEntity> | null;

  @WorkspaceJoinColumn('owner')
  ownerId: string | null;

  @WorkspaceRelation({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.subscriptionPlan,
    type: RelationType.MANY_TO_ONE,
    label: msg`Plan`,
    description: msg`Subscription plan`,
    icon: 'IconUser',
    inverseSideTarget: () => SubscriptionPlanWorkspaceEntity,
    inverseSideFieldKey: 'subscriptions',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  subscriptionPlan: Relation<SubscriptionPlanWorkspaceEntity> | null;

  @WorkspaceJoinColumn('subscriptionPlan')
  subscriptionPlanId: string | null;

  @WorkspaceRelation({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.tenant,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workspace`,
    description: msg`Subscription workspace`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => TenantWorkspaceEntity,
    inverseSideFieldKey: 'subscriptions',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  tenant: Relation<TenantWorkspaceEntity> | null;

  @WorkspaceJoinColumn('tenant')
  tenantId: string | null;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.billingSubscriptionId,
    type: FieldMetadataType.UUID,
    label: msg`Billing subscription Id`,
    description: msg`Associated Billing Subscription Id`,
    icon: 'IconMoneybag',
  })
  @WorkspaceIsSystem()
  billingSubscriptionId: string;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Person record Position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: SUBSCRIPTION_STANDARD_FIELD_IDS.searchVector,
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
