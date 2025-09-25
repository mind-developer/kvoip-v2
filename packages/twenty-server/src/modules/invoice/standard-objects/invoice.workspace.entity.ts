import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

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
    description: msg`Nomenclatura Comum Mercosul. Format: xxxx.xx.xx. Placeholder: 8471.30.12`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  ncm: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.cfop,
    type: FieldMetadataType.TEXT,
    label: msg`CFOP`,
    description: msg`Código Fiscal de Operações. Placeholder: 5102`,
    icon: 'IconFileCode',
  })
  @WorkspaceIsNullable()
  cfop: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.cstIcmsCsosn,
    type: FieldMetadataType.TEXT,
    label: msg`CST/CSOSN`,
    description: msg`Código da Situação Tributária ou CSOSN. Placeholder: 102`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstIcmsCsosn: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.unitOfMeasure,
    type: FieldMetadataType.TEXT,
    label: msg`Unit`,
    description: msg`Product unit of measure (e.g., kg, unit, liter)`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  unitOfMeasure: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.origin,
    type: FieldMetadataType.NUMBER,
    label: msg`Origem da Mercadoria`,
    description: msg`Origem da mercadoria (0-8). Placeholder: 0`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  origin: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.icmsRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ICMS (%)`,
    description: msg`Alíquota do ICMS. Placeholder: 18.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIcms: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.pisRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota PIS (%)`,
    description: msg`Alíquota do PIS. Placeholder: 1.65`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  ratePis: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.cofinsRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota COFINS (%)`,
    description: msg`Alíquota do COFINS. Placeholder: 7.60`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateCofins: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.ipiRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Valor/Alíquota IPI`,
    description: msg`Valor ou alíquota de IPI (se aplicável). Placeholder: 0.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIpi: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.issRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ISS`,
    description: msg`Aliquota do ISS. Algumas cidades permitem usar 4 dígitos decimais.`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIss: number;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.issRetained,
    type: FieldMetadataType.BOOLEAN,
    label: msg`ISS Retido`,
    description: msg`Informar true (verdadeiro) ou false (falso) se o ISS foi retido`,
    icon: 'IconTag',
    defaultValue: false,
  })
  @WorkspaceFieldIndex()
  issRetained: boolean;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.serviceListItem,
    type: FieldMetadataType.TEXT,
    label: msg`Item Lista Serviço`,
    description: msg`Informar o código da lista de serviços, normalmente de acordo com a Lei Complementar 116/2003.`,
    icon: 'IconNotes',
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
    label: msg`Discriminação`,
    description: msg`Discriminação dos serviços prestados.`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  discrimination: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.subscriberCode,
    type: FieldMetadataType.TEXT,
    label: msg`Código do Assinante`,
    description: msg`Código do assinante`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  subscriberCode: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.numSubscriberAgreement,
    type: FieldMetadataType.TEXT,
    label: msg`Número do Contrato do Assinante`,
    description: msg`Número do contrato do assinante`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  numSubscriberAgreement: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.classification,
    type: FieldMetadataType.TEXT,
    label: msg`Classificação`,
    description: msg`Classificação do produto`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  classification: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.unit,
    type: FieldMetadataType.TEXT,
    label: msg`Unidade Comercial`,
    description: msg`Unidade comercial. Placeholder: UN`,
    icon: 'IconBox',
  })
  @WorkspaceIsNullable()
  unit: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.justification,
    type: FieldMetadataType.TEXT,
    label: msg`Justificativa`,
    description: msg`Justificativa de cancelamento da Invoice`,
    icon: 'IconBox',
  })
  @WorkspaceIsNullable()
  justification: string;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.issueDate,
    type: FieldMetadataType.TEXT,
    label: msg`Data de emissão`,
    description: msg`Data de emissão da Invoice`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  issueDate: string | null;

  @WorkspaceField({
    standardId: INVOICE_FIELD_IDS.rpsNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Número RPS`,
    description: msg`Número RPS`,
    icon: 'IconHierarchy2',
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