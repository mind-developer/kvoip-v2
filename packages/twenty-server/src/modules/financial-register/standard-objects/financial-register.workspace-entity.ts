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
import { FINANCIAL_REGISTER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
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
export const SEARCH_FIELDS_FOR_FINANCIAL_REGISTER: FieldTypeAndNameMetadata[] =
  [
    { name: 'documentNumber', type: FieldMetadataType.TEXT },
    { name: 'paymentType', type: FieldMetadataType.TEXT },
    { name: 'message', type: FieldMetadataType.TEXT },
    { name: 'cpfCnpj', type: FieldMetadataType.TEXT },
  ];

// ============================================
// ENUMS
// ============================================

/**
 * Register Type - Discriminator field
 * Determines if this is an account receivable (A Receber) or payable (A Pagar)
 */
export enum RegisterType {
  RECEIVABLE = 'receivable', // A Receber - Money to receive from clients
  PAYABLE = 'payable', // A Pagar - Bills to pay to suppliers
}

registerEnumType(RegisterType, {
  name: 'RegisterType',
  description: 'Type of financial register: receivable or payable',
});

/**
 * Register Status - Unified status for both types
 * Some statuses are specific to RECEIVABLE only (doNotPay, bankRelease, disputed)
 */
export enum RegisterStatus {
  // Universal statuses (both RECEIVABLE and PAYABLE)
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',

  // RECEIVABLE-specific statuses
  DO_NOT_PAY = 'doNotPay', // Client requested to not pay this charge
  BANK_RELEASE = 'bankRelease', // Waiting for bank to release payment
  DISPUTED = 'disputed', // Client is disputing this charge
}

registerEnumType(RegisterStatus, {
  name: 'RegisterStatus',
  description: 'Status of the financial register',
});

// ============================================
// WORKSPACE ENTITY
// ============================================

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.financialRegister,
  namePlural: 'financialRegisters',
  labelSingular: msg`Financial Register`,
  labelPlural: msg`Financial Registers`,
  description: msg`Accounts receivable and payable records`,
  icon: STANDARD_OBJECT_ICONS.financialRegister,
  shortcut: 'F',
  labelIdentifierStandardId:
    FINANCIAL_REGISTER_STANDARD_FIELD_IDS.documentNumber,
})
@WorkspaceIsSearchable()
export class FinancialRegisterWorkspaceEntity extends BaseWorkspaceEntity {
  // ============================================
  // DISCRIMINATOR FIELD
  // ============================================

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.registerType,
    type: FieldMetadataType.SELECT,
    label: msg`Type`,
    description: msg`Register type: Receivable (A Receber) or Payable (A Pagar)`,
    icon: 'IconCategory',
    options: [
      {
        value: RegisterType.RECEIVABLE,
        label: 'A Receber',
        position: 0,
        color: 'blue',
      },
      {
        value: RegisterType.PAYABLE,
        label: 'A Pagar',
        position: 1,
        color: 'orange',
      },
    ],
    defaultValue: `'${RegisterType.RECEIVABLE}'`,
  })
  @WorkspaceFieldIndex()
  registerType: RegisterType;

  // ============================================
  // STATUS FIELD
  // ============================================

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Current status of the register`,
    icon: 'IconProgressCheck',
    options: [
      // Universal statuses
      {
        value: RegisterStatus.PENDING,
        label: 'Pendente',
        position: 0,
        color: 'blue',
      },
      {
        value: RegisterStatus.PAID,
        label: 'Pago',
        position: 1,
        color: 'green',
      },
      {
        value: RegisterStatus.OVERDUE,
        label: 'Vencido',
        position: 2,
        color: 'red',
      },
      {
        value: RegisterStatus.CANCELLED,
        label: 'Cancelado',
        position: 3,
        color: 'gray',
      },
      // RECEIVABLE-specific statuses
      {
        value: RegisterStatus.DO_NOT_PAY,
        label: 'Não Pagar',
        position: 4,
        color: 'yellow',
      },
      {
        value: RegisterStatus.BANK_RELEASE,
        label: 'Banco Liberar',
        position: 5,
        color: 'purple',
      },
      {
        value: RegisterStatus.DISPUTED,
        label: 'Contestado',
        position: 6,
        color: 'orange',
      },
    ],
    defaultValue: `'${RegisterStatus.PENDING}'`,
  })
  @WorkspaceFieldIndex()
  status: RegisterStatus;

  // ============================================
  // COMMON FIELDS (Both RECEIVABLE and PAYABLE)
  // ============================================

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.amount,
    type: FieldMetadataType.CURRENCY,
    label: msg`Valor`,
    description: msg`Amount to receive or pay`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  amount: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.dueDate,
    type: FieldMetadataType.DATE,
    label: msg`Vencimento`,
    description: msg`Due date for payment or receipt`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  dueDate: string | null;

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.cpfCnpj,
    type: FieldMetadataType.TEXT,
    label: msg`CPF/CNPJ`,
    description: msg`Tax ID (CPF or CNPJ) of the client or supplier`,
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
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.pixKey,
    type: FieldMetadataType.TEXT,
    label: msg`Chave PIX`,
    description: msg`PIX key for payment or receipt`,
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
  // RECEIVABLE-SPECIFIC FIELDS (nullable)
  // ============================================

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.documentNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Número do Documento`,
    description: msg`Document number (RECEIVABLE only - boleto number, invoice number)`,
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
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.isRecharge,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Recarga`,
    description: msg`Indicates if this is a telephony recharge (RECEIVABLE only)`,
    icon: 'IconRefresh',
    defaultValue: false,
  })
  @WorkspaceIsNullable()
  isRecharge: boolean | null;

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.bankSlipLink,
    type: FieldMetadataType.TEXT,
    label: msg`Link Boleto/Comprovante`,
    description: msg`Link to bank slip PDF or payment receipt (RECEIVABLE only)`,
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
  // PAYABLE-SPECIFIC FIELDS (nullable)
  // ============================================

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.paymentType,
    type: FieldMetadataType.TEXT,
    label: msg`Tipo de Pagamento`,
    description: msg`Payment type (PAYABLE only - PIX, TED, Boleto, etc.)`,
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
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.barcode,
    type: FieldMetadataType.TEXT,
    label: msg`Código de Barras`,
    description: msg`Barcode for boleto payment (PAYABLE only - 47 or 48 digits)`,
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
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.paymentDate,
    type: FieldMetadataType.DATE,
    label: msg`Data Pagamento`,
    description: msg`Actual payment date (PAYABLE only)`,
    icon: 'IconCalendarCheck',
  })
  @WorkspaceIsNullable()
  paymentDate: string | null;

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.message,
    type: FieldMetadataType.TEXT,
    label: msg`Mensagem`,
    description: msg`Additional message or notes (PAYABLE only)`,
    icon: 'IconMessage',
  })
  @WorkspaceIsNullable()
  message: string | null;

  // ============================================
  // SYSTEM FIELDS
  // ============================================

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Record position for ordering`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_FINANCIAL_REGISTER,
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
   * Company relation - Polymorphic usage:
   * - For RECEIVABLE: This is the CLIENT who owes money
   * - For PAYABLE: This is the SUPPLIER to whom we owe money
   */
  @WorkspaceRelation({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Fornecedor/Cliente`,
    description: msg`Related company (client for receivable, supplier for payable)`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'financialRegisters',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  /**
   * Integration relation - Links to payment gateway
   * Used for tracking which payment provider processed the transaction
   */
  @WorkspaceRelation({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.integration,
    type: RelationType.MANY_TO_ONE,
    label: msg`Gateway de Pagamento`,
    description: msg`Payment gateway integration (Inter Bank, etc.)`,
    icon: 'IconPlug',
    inverseSideTarget: () => IntegrationWorkspaceEntity,
    inverseSideFieldKey: 'financialRegisters',
  })
  @WorkspaceIsNullable()
  integration: Relation<IntegrationWorkspaceEntity> | null;

  @WorkspaceJoinColumn('integration')
  integrationId: string | null;

  /**
   * Invoice relation - RECEIVABLE only
   * Links to the invoice (NF) that generated this receivable
   */
  @WorkspaceRelation({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.invoice,
    type: RelationType.MANY_TO_ONE,
    label: msg`Nota Fiscal`,
    description: msg`Related invoice (RECEIVABLE only)`,
    icon: 'IconFileInvoice',
    inverseSideTarget: () => InvoiceWorkspaceEntity,
    inverseSideFieldKey: 'financialRegisters',
  })
  @WorkspaceIsNullable()
  invoice: Relation<InvoiceWorkspaceEntity> | null;

  @WorkspaceJoinColumn('invoice')
  invoiceId: string | null;

  /**
   * Financial Closing Execution relation - RECEIVABLE only
   * Links to the automated financial closing that created this receivable
   */
  @WorkspaceRelation({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.closingExecution,
    type: RelationType.MANY_TO_ONE,
    label: msg`Fechamento`,
    description: msg`Financial closing execution that generated this receivable`,
    icon: 'IconCalendarStats',
    inverseSideTarget: () => FinancialClosingExecutionWorkspaceEntity,
    inverseSideFieldKey: 'financialRegisters',
  })
  @WorkspaceIsNullable()
  closingExecution: Relation<FinancialClosingExecutionWorkspaceEntity> | null;

  @WorkspaceJoinColumn('closingExecution')
  closingExecutionId: string | null;

  // ============================================
  // POLYMORPHIC RELATIONS
  // ============================================

  @WorkspaceRelation({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the financial register`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the financial register (boleto PDFs, receipts, etc.)`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: FINANCIAL_REGISTER_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the financial register`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
