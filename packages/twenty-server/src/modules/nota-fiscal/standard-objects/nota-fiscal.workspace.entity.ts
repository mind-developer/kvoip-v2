import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { NOTA_FISCAL_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
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
  standardId: STANDARD_OBJECT_IDS.notaFiscal,
  namePlural: 'notasFiscais',
  labelSingular: msg`Nota Fiscal`,
  labelPlural: msg`Notas Fiscais`,
  description: msg`Nota fiscal`,
  icon: 'IconClipboardList',
  labelIdentifierStandardId: NOTA_FISCAL_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class NotaFiscalWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Issue name`,
    icon: 'IconFileUpload',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.nfType,
    type: FieldMetadataType.SELECT,
    label: msg`NF Type`,
    description: msg`Tipo de nota fiscal`,
    icon: 'IconTag',
    options: NfTypeOptions,
    defaultValue: "'none'",
  })
  @WorkspaceFieldIndex()
  nfType: string | null;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.totalAmount,
    type: FieldMetadataType.TEXT,
    label: msg`Total Amount`,
    description: msg`Total amount`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  totalAmount: string | null;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.percentNFe,
    type: FieldMetadataType.NUMBER,
    label: msg`NF-e`,
    description: msg`Percentage for Nota Fiscal Eletrônica (Electronic Invoice for Products)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfe: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.percentNFSe,
    type: FieldMetadataType.NUMBER,
    label: msg`NFS-e`,
    description: msg`Percentage for Nota Fiscal de Serviços Eletrônica (Electronic Service Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfse: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.percentNFCe,
    type: FieldMetadataType.NUMBER,
    label: msg`NFC-e`,
    description: msg`Percentage for Nota Fiscal ao Consumidor Eletrônica (Electronic Consumer Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfce: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.percentNFCom,
    type: FieldMetadataType.NUMBER,
    label: msg`NF-Com`,
    description: msg`Percentage for Nota Fiscal de Comunicação (Communication Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfcom: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.nfStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Status da Nota Fiscal`,
    icon: 'IconProgress',
    options: NfStatusOptions,
    defaultValue: "'draft'",
  })
  @WorkspaceFieldIndex()
  nfStatus: string;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.ncm,
    type: FieldMetadataType.TEXT,
    label: msg`NCM`,
    description: msg`Nomenclatura Comum Mercosul. Format: xxxx.xx.xx. Placeholder: 8471.30.12`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  ncm: string;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.cfop,
    type: FieldMetadataType.TEXT,
    label: msg`CFOP`,
    description: msg`Código Fiscal de Operações. Placeholder: 5102`,
    icon: 'IconFileCode',
  })
  @WorkspaceIsNullable()
  cfop: string;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.cstIcmsCsosn,
    type: FieldMetadataType.TEXT,
    label: msg`CST/CSOSN`,
    description: msg`Código da Situação Tributária ou CSOSN. Placeholder: 102`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstIcmsCsosn: string;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.unitOfMeasure,
    type: FieldMetadataType.TEXT,
    label: msg`Unit`,
    description: msg`Product unit of measure (e.g., kg, unit, liter)`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  unitOfMeasure: string;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.origem,
    type: FieldMetadataType.NUMBER,
    label: msg`Origem da Mercadoria`,
    description: msg`Origem da mercadoria (0-8). Placeholder: 0`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  origem: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.aliquotaIcms,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ICMS (%)`,
    description: msg`Alíquota do ICMS. Placeholder: 18.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaIcms: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.aliquotaPis,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota PIS (%)`,
    description: msg`Alíquota do PIS. Placeholder: 1.65`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaPis: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.aliquotaCofins,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota COFINS (%)`,
    description: msg`Alíquota do COFINS. Placeholder: 7.60`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaCofins: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.aliquotaIpi,
    type: FieldMetadataType.NUMBER,
    label: msg`Valor/Alíquota IPI`,
    description: msg`Valor ou alíquota de IPI (se aplicável). Placeholder: 0.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaIpi: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.aliquotaIss,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ISS`,
    description: msg`Aliquota do ISS. Algumas cidades permitem usar 4 dígitos decimais.`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaIss: number;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.issRetido,
    type: FieldMetadataType.BOOLEAN,
    label: msg`ISS Retido`,
    description: msg`Informar true (verdadeiro) ou false (falso) se o ISS foi retido`,
    icon: 'IconTag',
    defaultValue: false,
  })
  @WorkspaceFieldIndex()
  issRetido: boolean;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.itemListaServico,
    type: FieldMetadataType.TEXT,
    label: msg`Item Lista Serviço`,
    description: msg`Informar o código da lista de serviços, normalmente de acordo com a Lei Complementar 116/2003.`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  itemListaServico: string;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Product record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.discriminacao,
    type: FieldMetadataType.TEXT,
    label: msg`Discriminação`,
    description: msg`Discriminação dos serviços prestados.`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  discriminacao: string;

  // Relations
  @WorkspaceRelation({
    standardId: NOTA_FISCAL_FIELD_IDS.charge,
    type: RelationType.MANY_TO_ONE,
    label: msg`Charge`,
    description: msg`Notas fiscais linked to the charges`,
    icon: 'IconClipboardList',
    inverseSideTarget: () => ChargeWorkspaceEntity,
    inverseSideFieldKey: 'notaFiscal',
  })
  @WorkspaceIsNullable()
  charge: Relation<ChargeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('charge')
  chargeId: string | null;

  @WorkspaceRelation({
    standardId: NOTA_FISCAL_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Nota emitida`,
    description: msg`Attachments linked to the Nota Fiscal`,
    icon: 'IconFiles',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: NOTA_FISCAL_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Company linked to the Nota Fiscal`,
    icon: 'IconTag',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'notaFiscal',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: NOTA_FISCAL_FIELD_IDS.product,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Company linked to the products`,
    icon: 'IconTag',
    inverseSideTarget: () => ProductWorkspaceEntity,
    inverseSideFieldKey: 'notaFiscal',
  })
  @WorkspaceIsNullable()
  product: Relation<ProductWorkspaceEntity> | null;

  @WorkspaceJoinColumn('product')
  productId: string | null;

  // CHECK: The integration with Focus NFe doesn't appear in the select, but it's working by adding the id manually in the field
  @WorkspaceRelation({
    standardId: NOTA_FISCAL_FIELD_IDS.focusNFe,
    type: RelationType.MANY_TO_ONE,
    label: msg`Focus NFe Integration`,
    description: msg`Nota Fiscal linked to the Focus NFe Integration`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => FocusNFeWorkspaceEntity,
    inverseSideFieldKey: 'notaFiscal',
  })
  @WorkspaceIsNullable()
  focusNFe: Relation<FocusNFeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('focusNFe')
  focusNFeId: string | null;

  @WorkspaceRelation({
    standardId: NOTA_FISCAL_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the nota fiscal`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: NOTA_FISCAL_FIELD_IDS.searchVector,
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
