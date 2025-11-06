/* @kvoip-woulz proprietary */
import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { TEXT_VALIDATION_PATTERNS } from 'twenty-shared/utils';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ACCOUNT_PAYABLE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { IntegrationWorkspaceEntity } from 'src/modules/integrations/standard-objects/integration.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

// ============================================
// SEARCH CONFIGURATION
// ============================================
export const SEARCH_FIELDS_FOR_ACCOUNT_PAYABLE: FieldTypeAndNameMetadata[] = [
  { name: 'paymentType', type: FieldMetadataType.TEXT },
  { name: 'message', type: FieldMetadataType.TEXT },
  { name: 'cpfCnpj', type: FieldMetadataType.TEXT },
];

// ============================================
// ENUMS
// ============================================

/**
 * Payable Status - Status for accounts payable
 */
export enum PayableStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

registerEnumType(PayableStatus, {
  name: 'PayableStatus',
  description: 'Status of the account payable',
});

// ============================================
// WORKSPACE ENTITY
// ============================================

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.accountPayable,
  namePlural: 'accountsPayable',
  labelSingular: msg`Account Payable`,
  labelPlural: msg`Accounts Payable`,
  description: msg`Accounts payable records - bills to pay to suppliers`,
  icon: STANDARD_OBJECT_ICONS.accountPayable,
  shortcut: 'P',
  labelIdentifierStandardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.cpfCnpj,
})
@WorkspaceIsSearchable()
export class AccountPayableWorkspaceEntity extends BaseWorkspaceEntity {
  // ============================================
  // STATUS FIELD
  // ============================================

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Current status of the payable`,
    icon: 'IconProgressCheck',
    options: [
      {
        value: PayableStatus.PENDING,
        label: 'Pending',
        position: 0,
        color: 'blue',
      },
      {
        value: PayableStatus.PAID,
        label: 'Paid',
        position: 1,
        color: 'green',
      },
      {
        value: PayableStatus.OVERDUE,
        label: 'Overdue',
        position: 2,
        color: 'red',
      },
      {
        value: PayableStatus.CANCELLED,
        label: 'Cancelled',
        position: 3,
        color: 'gray',
      },
    ],
    defaultValue: `'${PayableStatus.PENDING}'`,
  })
  @WorkspaceFieldIndex()
  status: PayableStatus;

  // ============================================
  // COMMON FIELDS
  // ============================================

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.amount,
    type: FieldMetadataType.CURRENCY,
    label: msg`Amount`,
    description: msg`Amount to pay`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  amount: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.dueDate,
    type: FieldMetadataType.DATE,
    label: msg`Due Date`,
    description: msg`Due date for payment`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  dueDate: string | null;

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.cpfCnpj,
    type: FieldMetadataType.TEXT,
    label: msg`CPF/CNPJ`,
    description: msg`Tax ID (CPF or CNPJ) of the supplier`,
    icon: 'IconId',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.TAX_ID,
        errorMessage: msg`Use format: 000.000.000-00 or 00.000.000/0000-00`,
      },
    },
  })
  @WorkspaceIsNullable()
  cpfCnpj: string | null;

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.pixKey,
    type: FieldMetadataType.TEXT,
    label: msg`PIX Key`,
    description: msg`PIX key for payment`,
    icon: 'IconQrcode',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.PIX_KEY,
        errorMessage: msg`Invalid PIX key format`,
      },
    },
  })
  @WorkspaceIsNullable()
  pixKey: string | null;

  // ============================================
  // PAYABLE-SPECIFIC FIELDS
  // ============================================

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.paymentType,
    type: FieldMetadataType.TEXT,
    label: msg`Payment Type`,
    description: msg`Payment type (PIX, TED, Boleto, etc.)`,
    icon: 'IconCreditCard',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.PAYMENT_TYPE,
        errorMessage: msg`Invalid payment type`,
      },
    },
  })
  @WorkspaceIsNullable()
  paymentType: string | null;

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.barcode,
    type: FieldMetadataType.TEXT,
    label: msg`Barcode`,
    description: msg`Barcode for boleto payment (47 or 48 digits)`,
    icon: 'IconBarcode',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.BOLETO_BARCODE,
        errorMessage: msg`Barcode must have 47 or 48 digits`,
      },
    },
  })
  @WorkspaceIsNullable()
  barcode: string | null;

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.paymentDate,
    type: FieldMetadataType.DATE,
    label: msg`Payment Date`,
    description: msg`Actual payment date`,
    icon: 'IconCalendarCheck',
  })
  @WorkspaceIsNullable()
  paymentDate: string | null;

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.message,
    type: FieldMetadataType.TEXT,
    label: msg`Message`,
    description: msg`Additional message or notes`,
    icon: 'IconMessage',
  })
  @WorkspaceIsNullable()
  message: string | null;

  // ============================================
  // SYSTEM FIELDS
  // ============================================

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Record position for ordering`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_ACCOUNT_PAYABLE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  // ============================================
  // RELATIONS
  // ============================================

  /**
   * Company relation - This is the SUPPLIER to whom we owe money
   */
  @WorkspaceRelation({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Supplier`,
    description: msg`Supplier company for this payable`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'accountsPayable',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  /**
   * Integration relation - Links to payment gateway
   */
  @WorkspaceRelation({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.integration,
    type: RelationType.MANY_TO_ONE,
    label: msg`Payment Gateway`,
    description: msg`Payment gateway integration (Inter Bank, etc.)`,
    icon: 'IconPlug',
    inverseSideTarget: () => IntegrationWorkspaceEntity,
    inverseSideFieldKey: 'accountsPayable',
  })
  @WorkspaceIsNullable()
  integration: Relation<IntegrationWorkspaceEntity> | null;

  @WorkspaceJoinColumn('integration')
  integrationId: string | null;

  // ============================================
  // POLYMORPHIC RELATIONS
  // ============================================

  @WorkspaceRelation({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the account payable`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the account payable (boleto PDFs, receipts, etc.)`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the account payable`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
