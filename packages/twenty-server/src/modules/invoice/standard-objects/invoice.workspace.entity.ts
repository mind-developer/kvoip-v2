import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { TEXT_VALIDATION_PATTERNS } from 'twenty-shared/utils';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
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
import { INVOICE_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FocusNFeWorkspaceEntity } from 'src/modules/focus-nfe/standard-objects/focus-nfe.workspace-entity';
import { NfStatusOptions } from 'src/modules/focus-nfe/types/NfStatus';
import { NfTypeOptions } from 'src/modules/focus-nfe/types/NfType';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

export const SEARCH_FIELDS_FOR_PRODUCT: FieldTypeAndNameMetadata[] = [
  { name: 'name', type: FieldMetadataType.TEXT },
  { name: 'ncm', type: FieldMetadataType.TEXT },
  { name: 'cfop', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.invoice,
  namePlural: 'invoices',
  labelSingular: msg`Invoice`,
  labelPlural: msg`Invoices`,
  description: msg`All invoices issued by the company`,
  icon: 'IconFileDollar',
  labelIdentifierStandardId: INVOICE_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class InvoiceWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Issue name`,
    icon: 'IconFileUpload',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.nfType,
    type: FieldMetadataType.SELECT,
    label: msg`NF Type`,
    description: msg`Type of the Invoice`,
    icon: 'IconTag',
    options: NfTypeOptions,
    defaultValue: "'none'",
  })
  @WorkspaceFieldIndex()
  nfType: string | null;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.totalAmount,
    type: FieldMetadataType.TEXT,
    label: msg`Total Amount`,
    description: msg`Total amount`,
    icon: 'IconTag',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.TOTAL_AMOUNT,
        errorMessage: 'Enter a valid amount (e.g., 1000.00)',
      },
    },
  })
  @WorkspaceIsNullable()
  totalAmount: string | null;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.percentNFe,
    type: FieldMetadataType.NUMBER,
    label: msg`NF-e`,
    description: msg`Percentage for Electronic Invoice for Products`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfe: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.percentNFSe,
    type: FieldMetadataType.NUMBER,
    label: msg`NFS-e`,
    description: msg`Percentage for Electronic Service Invoice`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfse: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.percentNFCe,
    type: FieldMetadataType.NUMBER,
    label: msg`NFC-e`,
    description: msg`Percentage for Electronic Consumer Invoice`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfce: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.percentNFCom,
    type: FieldMetadataType.NUMBER,
    label: msg`NF-Com`,
    description: msg`Percentage for Communication Invoice`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfcom: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.nfStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Status of the Invoice`,
    icon: 'IconProgress',
    options: NfStatusOptions,
    defaultValue: "'draft'",
  })
  @WorkspaceFieldIndex()
  nfStatus: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.ncm,
    type: FieldMetadataType.TEXT,
    label: msg`NCM`,
    description: msg`Mercosur Common Nomenclature. Format: xxxx.xx.xx. Example: 8471.30.12`,
    icon: 'IconBarcode',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.NCM,
        errorMessage: 'Use the format: 0000.00.00',
      },
    },
  })
  @WorkspaceIsNullable()
  ncm: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.cfop,
    type: FieldMetadataType.TEXT,
    label: msg`CFOP`,
    description: msg`Fiscal Operation Code. Example: 5102`,
    icon: 'IconFileCode',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.BR_CFOP,
        errorMessage: 'Use the format: 0000',
      },
    },
  })
  @WorkspaceIsNullable()
  cfop: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.cstIcmsCsosn,
    type: FieldMetadataType.TEXT,
    label: msg`CST/CSOSN`,
    description: msg`Tributary Situation Code or CSOSN. Example: 102`,
    icon: 'IconReceiptTax',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CSTICMSCSOSN,
        errorMessage: 'Use the format: 000 or 0000)',
      },
    },
  })
  @WorkspaceIsNullable()
  cstIcmsCsosn: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.unitOfMeasure,
    type: FieldMetadataType.TEXT,
    label: msg`Unit`,
    description: msg`Product unit of measure (e.g., kg, unit, liter)`,
    icon: 'IconSettings',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.UNIT_OF_MEASURE,
        errorMessage: 'Example: kg, unit, liter',
      },
    },
  })
  @WorkspaceIsNullable()
  unitOfMeasure: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.origin,
    type: FieldMetadataType.NUMBER,
    label: msg`Product origin`,
    description: msg`Product origin (0-8). Example: 0`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  origin: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.icmsRate,
    type: FieldMetadataType.NUMBER,
    label: msg`ICMS rate (%)`,
    description: msg`ICMS rate. Example: 18.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIcms: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.pisRate,
    type: FieldMetadataType.NUMBER,
    label: msg`PIS rate (%)`,
    description: msg`PIS rate. Example: 1.65`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  ratePis: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.cofinsRate,
    type: FieldMetadataType.NUMBER,
    label: msg`COFINS rate (%)`,
    description: msg`COFINS rate. Example: 7.60`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateCofins: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.ipiRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Value/IPI rate`,
    description: msg`Value or IPI rate. Example: 0.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIpi: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.issRate,
    type: FieldMetadataType.NUMBER,
    label: msg`ISS rate (%)`,
    description: msg`ISS rate. Some cities allow using 4 decimal places.`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIss: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.issRetained,
    type: FieldMetadataType.BOOLEAN,
    label: msg`ISS Retained`,
    description: msg`Inform true or false if the ISS was retained`,
    icon: 'IconTag',
    defaultValue: false,
  })
  @WorkspaceFieldIndex()
  issRetained: boolean;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.serviceListItem,
    type: FieldMetadataType.TEXT,
    label: msg`Service List Item`,
    description: msg`Inform the service list code, usually according to Law Complement 116/2003.`,
    icon: 'IconNotes',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.SERVICE_LIST_ITEM,
        errorMessage: 'Use the format: 00.00)',
      },
    },
  })
  @WorkspaceIsNullable()
  serviceListItem: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Product record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.discrimination,
    type: FieldMetadataType.TEXT,
    label: msg`Discrimination`,
    description: msg`Discrimination of the services provided.`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  discrimination: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.subscriberCode,
    type: FieldMetadataType.TEXT,
    label: msg`Subscriber Code`,
    description: msg`Subscriber code`,
    icon: 'IconNotes',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.SUBSCRIBER_CODE,
        errorMessage: 'Enter a valid subscriber code (3-20 characters)',
      },
    },
  })
  @WorkspaceIsNullable()
  subscriberCode: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.numSubscriberAgreement,
    type: FieldMetadataType.TEXT,
    label: msg`Subscriber Agreement Number`,
    description: msg`Subscriber agreement number`,
    icon: 'IconNotes',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.NUM_SUBSCRIBER_AGREEMENT,
        errorMessage: 'Enter a valid agreement number (3-20 characters)',
      },
    },
  })
  @WorkspaceIsNullable()
  numSubscriberAgreement: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.classification,
    type: FieldMetadataType.TEXT,
    label: msg`Classification`,
    description: msg`Product classification`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  classification: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.unit,
    type: FieldMetadataType.TEXT,
    label: msg`Commercial Unit`,
    description: msg`Commercial unit. Example: UN`,
    icon: 'IconBox',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.COMMERCIAL_UNIT,
        errorMessage: 'Exemple: UN, KG, LT',
      },
    },
  })
  @WorkspaceIsNullable()
  unit: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.justification,
    type: FieldMetadataType.TEXT,
    label: msg`Justification`,
    description: msg`Justification of the invoice cancellation`,
    icon: 'IconBox',
  })
  @WorkspaceIsNullable()
  justification: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.issueDate,
    type: FieldMetadataType.TEXT,
    label: msg`Issue Date`,
    description: msg`Issue date of the invoice`,
    icon: 'IconHierarchy2',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.ISSUE_DATE,
        errorMessage: 'Use format: DD/MM/YYYY)',
      },
    },
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  issueDate: string | null;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.rpsNumber,
    type: FieldMetadataType.TEXT,
    label: msg`RPS Number`,
    description: msg`RPS number`,
    icon: 'IconHierarchy2',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.RPS_NUMBER,
        errorMessage: 'Follow the format: XXX-000',
      },
    },
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  rpsNumber: string | null;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: INVOICE_FIELD_IDS.charge,
    type: RelationType.MANY_TO_ONE,
    label: msg`Charge`,
    description: msg`Invoices linked to the charges`,
    icon: 'IconReportMoney',
    inverseSideTarget: () => ChargeWorkspaceEntity,
    inverseSideFieldKey: 'invoices',
  })
  @WorkspaceIsNullable()
  charge: Relation<ChargeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('charge')
  chargeId: string | null;

  @WorkspaceRelation({
    standardId: INVOICE_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Invoice`,
    description: msg`Attachments linked to the Invoice`,
    icon: 'IconFiles',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: INVOICE_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Company linked to the Invoice`,
    icon: 'IconTag',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'invoices',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: INVOICE_FIELD_IDS.product,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Company linked to the products`,
    icon: 'IconClipboardList',
    inverseSideTarget: () => ProductWorkspaceEntity,
    inverseSideFieldKey: 'invoices',
  })
  @WorkspaceIsNullable()
  product: Relation<ProductWorkspaceEntity> | null;

  @WorkspaceJoinColumn('product')
  productId: string | null;

  // CHECK: The integration with Focus NFe doesn't appear in the select, but it's working by adding the id manually in the field
  @WorkspaceRelation({
    standardId: INVOICE_FIELD_IDS.focusNFe,
    type: RelationType.MANY_TO_ONE,
    label: msg`Focus NFe Integration`,
    description: msg`Invoice linked to the Focus NFe Integration`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => FocusNFeWorkspaceEntity,
    inverseSideFieldKey: 'invoices',
  })
  @WorkspaceIsNullable()
  focusNFe: Relation<FocusNFeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('focusNFe')
  focusNFeId: string | null;

  @WorkspaceRelation({
    standardId: INVOICE_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the invoice`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: INVOICE_FIELD_IDS.companyFinancialClosingExecution,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company Financial Closing Execution`,
    description: msg`Reference to the company financial closing execution`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyFinancialClosingExecutionWorkspaceEntity,
    inverseSideFieldKey: 'invoices',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  companyFinancialClosingExecution: Relation<CompanyFinancialClosingExecutionWorkspaceEntity> | null;

  @WorkspaceJoinColumn('companyFinancialClosingExecution')
  companyFinancialClosingExecutionId: string | null;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_PRODUCT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
