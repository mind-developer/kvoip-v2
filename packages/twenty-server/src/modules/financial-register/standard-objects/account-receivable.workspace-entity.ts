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
import { ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { FinancialClosingExecutionWorkspaceEntity } from 'src/modules/financial-closing-execution/standard-objects/financial-closing-execution.workspace-entity';
import { IntegrationWorkspaceEntity } from 'src/modules/integrations/standard-objects/integration.workspace-entity';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

// ============================================
// SEARCH CONFIGURATION
// ============================================
export const SEARCH_FIELDS_FOR_ACCOUNT_RECEIVABLE: FieldTypeAndNameMetadata[] =
  [
    { name: 'name', type: FieldMetadataType.TEXT },
    { name: 'documentNumber', type: FieldMetadataType.TEXT },
    { name: 'cpfCnpj', type: FieldMetadataType.TEXT },
  ];

// ============================================
// ENUMS
// ============================================

/**
 * Receivable Status - Status for accounts receivable
 */
export enum ReceivableStatus {
  // Universal statuses
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',

  // Receivable-specific statuses
  DO_NOT_PAY = 'doNotPay', // Client requested to not pay this charge
  BANK_RELEASE = 'bankRelease', // Waiting for bank to release payment
  DISPUTED = 'disputed', // Client is disputing this charge
}

registerEnumType(ReceivableStatus, {
  name: 'ReceivableStatus',
  description: 'Status of the account receivable',
});

// ============================================
// WORKSPACE ENTITY
// ============================================

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.accountReceivable,
  namePlural: 'accountsReceivable',
  labelSingular: msg`Account Receivable`,
  labelPlural: msg`Accounts Receivable`,
  description: msg`Accounts receivable records - money to receive from clients`,
  icon: STANDARD_OBJECT_ICONS.accountReceivable,
  shortcut: 'R',
  labelIdentifierStandardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class AccountReceivableWorkspaceEntity extends BaseWorkspaceEntity {
  // ============================================
  // STATUS FIELD
  // ============================================

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Current status of the receivable`,
    icon: 'IconProgressCheck',
    options: [
      {
        value: ReceivableStatus.PENDING,
        label: 'Pending',
        position: 0,
        color: 'blue',
      },
      {
        value: ReceivableStatus.PAID,
        label: 'Paid',
        position: 1,
        color: 'green',
      },
      {
        value: ReceivableStatus.OVERDUE,
        label: 'Overdue',
        position: 2,
        color: 'red',
      },
      {
        value: ReceivableStatus.CANCELLED,
        label: 'Cancelled',
        position: 3,
        color: 'gray',
      },
      {
        value: ReceivableStatus.DO_NOT_PAY,
        label: 'Do Not Pay',
        position: 4,
        color: 'yellow',
      },
      {
        value: ReceivableStatus.BANK_RELEASE,
        label: 'Bank Release',
        position: 5,
        color: 'purple',
      },
      {
        value: ReceivableStatus.DISPUTED,
        label: 'Disputed',
        position: 6,
        color: 'orange',
      },
    ],
    defaultValue: `'${ReceivableStatus.PENDING}'`,
  })
  @WorkspaceFieldIndex()
  status: ReceivableStatus;

  // ============================================
  // COMMON FIELDS
  // ============================================

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Receivable description or reference`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.amount,
    type: FieldMetadataType.CURRENCY,
    label: msg`Amount`,
    description: msg`Amount to receive`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  amount: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.dueDate,
    type: FieldMetadataType.DATE,
    label: msg`Due Date`,
    description: msg`Due date for receipt`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  dueDate: string | null;

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.cpfCnpj,
    type: FieldMetadataType.TEXT,
    label: msg`CPF/CNPJ`,
    description: msg`Tax ID (CPF or CNPJ) of the client`,
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
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.pixKey,
    type: FieldMetadataType.TEXT,
    label: msg`PIX Key`,
    description: msg`PIX key for receipt`,
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
  // RECEIVABLE-SPECIFIC FIELDS
  // ============================================

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.documentNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Document Number`,
    description: msg`Document number (boleto number, invoice number)`,
    icon: 'IconFileText',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.DOCUMENT_NUMBER,
        errorMessage: msg`Use alphanumeric characters and hyphens only`,
      },
    },
  })
  @WorkspaceIsNullable()
  documentNumber: string | null;

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.isRecharge,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Recharge`,
    description: msg`Indicates if this is a telephony recharge`,
    icon: 'IconRefresh',
    defaultValue: false,
  })
  @WorkspaceIsNullable()
  isRecharge: boolean | null;

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.bankSlipLink,
    type: FieldMetadataType.TEXT,
    label: msg`Bank Slip Link`,
    description: msg`Link to bank slip PDF or payment receipt`,
    icon: 'IconLink',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.BANK_SLIP_LINK,
        errorMessage: msg`Invalid URL format`,
      },
    },
  })
  @WorkspaceIsNullable()
  bankSlipLink: string | null;

  // ============================================
  // SYSTEM FIELDS
  // ============================================

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Record position for ordering`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_ACCOUNT_RECEIVABLE,
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
   * Company relation - This is the CLIENT who owes money
   */
  @WorkspaceRelation({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Client`,
    description: msg`Client company for this receivable`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'accountsReceivable',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  /**
   * Integration relation - Links to payment gateway
   */
  @WorkspaceRelation({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.integration,
    type: RelationType.MANY_TO_ONE,
    label: msg`Payment Gateway`,
    description: msg`Payment gateway integration (Inter Bank, etc.)`,
    icon: 'IconPlug',
    inverseSideTarget: () => IntegrationWorkspaceEntity,
    inverseSideFieldKey: 'accountsReceivable',
  })
  @WorkspaceIsNullable()
  integration: Relation<IntegrationWorkspaceEntity> | null;

  @WorkspaceJoinColumn('integration')
  integrationId: string | null;

  /**
   * Invoice relation - Links to the invoice (NF) that generated this receivable
   */
  @WorkspaceRelation({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.invoice,
    type: RelationType.MANY_TO_ONE,
    label: msg`Invoice`,
    description: msg`Related invoice`,
    icon: 'IconFileInvoice',
    inverseSideTarget: () => InvoiceWorkspaceEntity,
    inverseSideFieldKey: 'accountsReceivable',
  })
  @WorkspaceIsNullable()
  invoice: Relation<InvoiceWorkspaceEntity> | null;

  @WorkspaceJoinColumn('invoice')
  invoiceId: string | null;

  /**
   * Financial Closing Execution relation
   */
  @WorkspaceRelation({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.closingExecution,
    type: RelationType.MANY_TO_ONE,
    label: msg`Closing`,
    description: msg`Financial closing execution that generated this receivable`,
    icon: 'IconCalendarStats',
    inverseSideTarget: () => FinancialClosingExecutionWorkspaceEntity,
    inverseSideFieldKey: 'accountsReceivable',
  })
  @WorkspaceIsNullable()
  closingExecution: Relation<FinancialClosingExecutionWorkspaceEntity> | null;

  @WorkspaceJoinColumn('closingExecution')
  closingExecutionId: string | null;

  // ============================================
  // POLYMORPHIC RELATIONS
  // ============================================

  @WorkspaceRelation({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the account receivable`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the account receivable (boleto PDFs, receipts, etc.)`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the account receivable`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
