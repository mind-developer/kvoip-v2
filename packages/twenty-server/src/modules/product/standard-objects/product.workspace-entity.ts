import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
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
import { PRODUCT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';

export const SEARCH_FIELDS_FOR_PRODUCT: FieldTypeAndNameMetadata[] = [
  { name: 'name', type: FieldMetadataType.TEXT },
  { name: 'ncm', type: FieldMetadataType.TEXT },
  { name: 'cfop', type: FieldMetadataType.TEXT },
  { name: 'cest', type: FieldMetadataType.TEXT },
];

export enum ProductTypeStatus {
  SERVICE = 'SERVICE',
  COMMODITY = 'COMMODITY',
}

const ProductTypeStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: ProductTypeStatus.SERVICE,
    label: 'Serviço',
    position: 0,
    color: 'sky',
  },
  {
    value: ProductTypeStatus.COMMODITY,
    label: 'Mercadoria',
    position: 1,
    color: 'green',
  },
];

registerEnumType(ProductTypeStatus, {
  name: 'ProductTypeStatus',
  description: 'Product type status options',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.product,
  namePlural: 'products',
  labelSingular: msg`Product`,
  labelPlural: msg`Products`,
  description: msg`A product that can be sold`,
  icon: 'IconClipboardList',
  labelIdentifierStandardId: PRODUCT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class ProductWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Product Name`,
    description: msg`Product name`,
    icon: 'IconClipboardList',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.productType,
    type: FieldMetadataType.SELECT,
    label: msg`Tipo de produto`,
    description: msg`Tipo de produto`,
    icon: 'IconTag',
    options: ProductTypeStatusOptions,
  })
  @WorkspaceIsNullable()
  productType: ProductTypeStatus | null;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.salePrice,
    type: FieldMetadataType.NUMBER,
    label: msg`Price`,
    description: msg`Product sale price`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  salePrice: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cost,
    type: FieldMetadataType.NUMBER,
    label: msg`Cost`,
    description: msg`Product cost`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  cost: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.unitOfMeasure,
    type: FieldMetadataType.TEXT,
    label: msg`Unit`,
    description: msg`Product unit of measure (e.g., kg, unit, liter)`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  unitOfMeasure: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Product status (active products can be used in charges)`,
    icon: 'IconProgress',
    options: [
      { value: 'active', label: 'Active', position: 0, color: 'green' },
      { value: 'inactive', label: 'Inactive', position: 1, color: 'red' },
    ],
    defaultValue: "'active'",
  })
  @WorkspaceFieldIndex()
  status: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Product record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.ncm,
    type: FieldMetadataType.TEXT,
    label: msg`NCM`,
    description: msg`Nomenclatura Comum Mercosul. Format: xxxx.xx.xx. Placeholder: 8471.30.12`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  ncm: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cfop,
    type: FieldMetadataType.TEXT,
    label: msg`CFOP`,
    description: msg`Código Fiscal de Operações. Placeholder: 5102`,
    icon: 'IconFileCode',
  })
  @WorkspaceIsNullable()
  cfop: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cest,
    type: FieldMetadataType.TEXT,
    label: msg`CEST`,
    description: msg`Código Especificador da Substituição Tributária. Placeholder: 28.038.00`,
    icon: 'IconFileCode',
  })
  @WorkspaceIsNullable()
  cest: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.unit,
    type: FieldMetadataType.TEXT,
    label: msg`Unidade Comercial`,
    description: msg`Unidade comercial. Placeholder: UN`,
    icon: 'IconBox',
  })
  @WorkspaceIsNullable()
  unit: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.origin,
    type: FieldMetadataType.NUMBER,
    label: msg`Origem da Mercadoria`,
    description: msg`Origem da mercadoria (0-8). Placeholder: 0`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  origem: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstIcmsCsosn,
    type: FieldMetadataType.TEXT,
    label: msg`CST ICMS/CSOSN`,
    description: msg`Código da Situação Tributária ou CSOSN. Placeholder: 102`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstIcmsCsosn: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstPis,
    type: FieldMetadataType.TEXT,
    label: msg`CST PIS`,
    description: msg`CST do PIS. Placeholder: 01`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstPis: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstCofins,
    type: FieldMetadataType.TEXT,
    label: msg`CST COFINS`,
    description: msg`CST do COFINS. Placeholder: 01`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstCofins: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.rateIcms,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ICMS (%)`,
    description: msg`Alíquota do ICMS. Placeholder: 18.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIcms: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.ratePis,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota PIS (%)`,
    description: msg`Alíquota do PIS. Placeholder: 1.65`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  ratePis: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.rateCofins,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota COFINS (%)`,
    description: msg`Alíquota do COFINS. Placeholder: 7.60`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateCofins: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.rateIss,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ISS`,
    description: msg`Aliquota do ISS. Algumas cidades permitem usar 4 dígitos decimais.`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIss: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.ipiValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Valor/Alíquota IPI`,
    description: msg`Valor ou alíquota de IPI (se aplicável). Placeholder: 0.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  ipiValue: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.issRetained,
    type: FieldMetadataType.BOOLEAN,
    label: msg`ISS Retido`,
    description: msg`Informar true (verdadeiro) ou false (falso) se o ISS foi retido`,
    icon: 'IconTag',
    defaultValue: false,
  })
  @WorkspaceFieldIndex()
  issRetained: boolean;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.serviceListItem,
    type: FieldMetadataType.TEXT,
    label: msg`Item Lista Serviço`,
    description: msg`Informar o código da lista de serviços, normalmente de acordo com a Lei Complementar 116/2003.`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  serviceListItem: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.municipalTaxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Código Tributário Município`,
    description: msg`Informar o código tributário de acordo com a tabela de cada município (não há um padrão).`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  municipalTaxCode: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.classification,
    type: FieldMetadataType.TEXT,
    label: msg`Classificação`,
    description: msg`Classificação do produto`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  classification: string;

  // Relations
  @WorkspaceRelation({
    standardId: PRODUCT_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Company linked to the products`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'products',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: PRODUCT_STANDARD_FIELD_IDS.charges,
    type: RelationType.ONE_TO_MANY,
    label: msg`Charges`,
    description: msg`Charges using this product`,
    icon: 'IconReportMoney',
    inverseSideTarget: () => ChargeWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  charges: Relation<ChargeWorkspaceEntity[]> | null;

  @WorkspaceRelation({
    standardId: PRODUCT_STANDARD_FIELD_IDS.invoices,
    type: RelationType.ONE_TO_MANY,
    label: msg`Invoices`,
    description: msg`Invoices using this product`,
    icon: 'IconFileDollar',
    inverseSideTarget: () => InvoiceWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  invoices: Relation<InvoiceWorkspaceEntity[]> | null;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.searchVector,
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
