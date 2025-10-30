import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { TEXT_VALIDATION_PATTERNS } from 'twenty-shared/utils';
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
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.PRODUCT_NAME,
        errorMessage: msg`Add a product name`,
      },
    },
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.productType,
    type: FieldMetadataType.SELECT,
    label: msg`Product Type`,
    description: msg`Product type`,
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
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.UNIT_OF_MEASURE,
        errorMessage: msg`Add a unit of measure`,
      },
    },
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
    description: msg`Mercosur Common Nomenclature. Format: xxxx.xx.xx. Example: 8471.30.12`,
    icon: 'IconBarcode',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.NCM,
        errorMessage: msg`Use the format: 0000.00.00`,
      },
    },
  })
  @WorkspaceIsNullable()
  ncm: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cfop,
    type: FieldMetadataType.TEXT,
    label: msg`CFOP`,
    description: msg`Fiscal Operation Code. Example: 5102`,
    icon: 'IconFileCode',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CFOP,
        errorMessage: msg`Use the format: 0000`,
      },
    },
  })
  @WorkspaceIsNullable()
  cfop: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cest,
    type: FieldMetadataType.TEXT,
    label: msg`CEST`,
    description: msg`Tributary Substitution Code. Example: 28.038.00`,
    icon: 'IconFileCode',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CEST,
        errorMessage: msg`Use the format: 00.000.00`,
      },
    },
  })
  @WorkspaceIsNullable()
  cest: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.unit,
    type: FieldMetadataType.TEXT,
    label: msg`Commercial Unit`,
    description: msg`Commercial unit. Example: UN`,
    icon: 'IconBox',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.COMMERCIAL_UNIT,
        errorMessage: msg`Add a commercial unit`,
      },
    },
  })
  @WorkspaceIsNullable()
  unit: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.origin,
    type: FieldMetadataType.NUMBER,
    label: msg`Product Origin`,
    description: msg`Product origin (0-8). Example: 0`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  origem: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstIcmsCsosn,
    type: FieldMetadataType.TEXT,
    label: msg`CST ICMS/CSOSN`,
    description: msg`Tributary Situation Code or CSOSN. Example: 102`,
    icon: 'IconReceiptTax',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CSTICMSCSOSN,
        errorMessage: msg`Use the format: 000 or 0000`,
      },
    },
  })
  @WorkspaceIsNullable()
  cstIcmsCsosn: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstPis,
    type: FieldMetadataType.TEXT,
    label: msg`CST PIS`,
    description: msg`CST of PIS. Example: 01`,
    icon: 'IconReceiptTax',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CST_PIS_COFINS,
        errorMessage: msg`Use the format: 00`,
      },
    },
  })
  @WorkspaceIsNullable()
  cstPis: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstCofins,
    type: FieldMetadataType.TEXT,
    label: msg`CST COFINS`,
    description: msg`CST of COFINS. Example: 01`,
    icon: 'IconReceiptTax',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CST_PIS_COFINS,
        errorMessage: msg`Use the format: 00`,
      },
    },
  })
  @WorkspaceIsNullable()
  cstCofins: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.rateIcms,
    type: FieldMetadataType.NUMBER,
    label: msg`ICMS rate (%)`,
    description: msg`ICMS rate. Example: 18.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIcms: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.ratePis,
    type: FieldMetadataType.NUMBER,
    label: msg`PIS rate (%)`,
    description: msg`PIS rate. Example: 1.65`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  ratePis: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.rateCofins,
    type: FieldMetadataType.NUMBER,
    label: msg`COFINS rate (%)`,
    description: msg`COFINS rate. Example: 7.60`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateCofins: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.rateIss,
    type: FieldMetadataType.NUMBER,
    label: msg`ISS rate (%)`,
    description: msg`ISS rate. Some cities allow using 4 decimal places.`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  rateIss: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.ipiValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Value/IPI rate`,
    description: msg`Value or IPI rate. Example: 0.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  ipiValue: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.issRetained,
    type: FieldMetadataType.BOOLEAN,
    label: msg`ISS Retained`,
    description: msg`Inform true or false if the ISS was retained`,
    icon: 'IconTag',
    defaultValue: false,
  })
  @WorkspaceFieldIndex()
  issRetained: boolean;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.serviceListItem,
    type: FieldMetadataType.TEXT,
    label: msg`Service List Item`,
    description: msg`Inform the service list code, usually according to Law Complement 116/2003.`,
    icon: 'IconNotes',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.SERVICE_LIST_ITEM,
        errorMessage: msg`Use the format: 00.00`,
      },
    },
  })
  @WorkspaceIsNullable()
  serviceListItem: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.municipalTaxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Municipal Tax Code`,
    description: msg`Inform the municipal tax code according to the table of each city (there is no standard).`,
    icon: 'IconNotes',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.MUNICIPAL_TAX_CODE,
        errorMessage: msg`Add a municipal tax code`,
      },
    },
  })
  @WorkspaceIsNullable()
  municipalTaxCode: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.classification,
    type: FieldMetadataType.TEXT,
    label: msg`Classification`,
    description: msg`Product classification`,
    icon: 'IconNotes',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CLASSIFICATION,
        errorMessage: msg`Add a product classification`,
      },
    },
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
