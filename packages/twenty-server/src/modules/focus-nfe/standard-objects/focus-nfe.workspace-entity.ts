/* @kvoip-woulz proprietary */
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

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
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { FOCUS_NFE_STANDARD_FIELD_ID } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_INTEGRATION: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum TaxRegime {
  SimplesNacional = 'simples_nacional',
  LucroPresumido = 'lucro_presumido',
  LucroReal = 'lucro_real',
}

export const TaxRegimeOptions: FieldMetadataComplexOption[] = [
  {
    value: TaxRegime.SimplesNacional,
    label: 'Simples Nacional',
    position: 0,
    color: 'gray',
  },
  {
    value: TaxRegime.LucroPresumido,
    label: 'Lucro Presumido',
    position: 1,
    color: 'gray',
  },
  {
    value: TaxRegime.LucroReal,
    label: 'Lucro Real',
    position: 2,
    color: 'gray',
  },
];

registerEnumType(TaxRegimeOptions, {
  name: 'TaxRegime',
  description: 'Tax regime options',
});

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const StatusOptions: FieldMetadataComplexOption[] = [
  {
    value: Status.ACTIVE,
    label: 'Active',
    position: 0,
    color: 'green',
  },
  {
    value: Status.INACTIVE,
    label: 'Inactive',
    position: 1,
    color: 'red',
  },
];

registerEnumType(StatusOptions, {
  name: 'Status',
  description: 'Status options',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.focusNFe,
  namePlural: 'focusNFeIntegrations',
  labelSingular: msg`Focus NFe Integration`,
  labelPlural: msg`Focus NFe Integrations`,
  description: msg`A integration of Focus NFe`,
  icon: 'IconFolder',
  labelIdentifierStandardId: FOCUS_NFE_STANDARD_FIELD_ID.name,
})
@WorkspaceIsSystem()
@WorkspaceIsSearchable()
@ObjectType()
export class FocusNFeWorkspaceEntity extends BaseWorkspaceEntity {
  // Integration Focus NF-e
  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Integration name`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  name: string | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.token,
    type: FieldMetadataType.TEXT,
    label: msg`Token`,
    description: msg`Token`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: false })
  token: string;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Focus NF-e integration status`,
    icon: 'IconProgress',
    options: StatusOptions,
    defaultValue: "'active'",
  })
  @WorkspaceFieldIndex()
  @Field(() => String, { nullable: true })
  status: Status | null;

  // Issuer data
  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.companyName,
    type: FieldMetadataType.TEXT,
    label: msg`Company Name`,
    description: msg`Company name`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  companyName: string | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.cnpj,
    type: FieldMetadataType.TEXT,
    label: msg`CNPJ`,
    description: msg`CNPJ`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  cnpj?: string | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.cpf,
    type: FieldMetadataType.TEXT,
    label: msg`CPF`,
    description: msg`CPF`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  cpf?: string | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.ie,
    type: FieldMetadataType.TEXT,
    label: msg`IE`,
    description: msg`Inscrição estadual`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  ie?: string | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.inscricaoMunicipal,
    type: FieldMetadataType.TEXT,
    label: msg`Inscrição Municipal`,
    description: msg`Inscrição municipal`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  inscricaoMunicipal?: string | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.cnaeCode,
    type: FieldMetadataType.TEXT,
    label: msg`CNAE Code`,
    description: msg`CNAE Code`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  cnaeCode?: string | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.cep,
    type: FieldMetadataType.TEXT,
    label: msg`CEP`,
    description: msg`CEP`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: false })
  cep: string;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.street,
    type: FieldMetadataType.TEXT,
    label: msg`Street`,
    description: msg`Street`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: false })
  street: string;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.number,
    type: FieldMetadataType.TEXT,
    label: msg`Number`,
    description: msg`Number`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: false })
  number: string;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.neighborhood,
    type: FieldMetadataType.TEXT,
    label: msg`Neighborhood`,
    description: msg`Neighborhood`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: false })
  neighborhood: string;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.city,
    type: FieldMetadataType.TEXT,
    label: msg`City`,
    description: msg`City`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: false })
  city: string;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.state,
    type: FieldMetadataType.TEXT,
    label: msg`State`,
    description: msg`State`,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: false })
  state: string;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.taxRegime,
    type: FieldMetadataType.SELECT,
    label: msg`NF Type`,
    description: msg`NF Type`,
    icon: 'IconTag',
    options: TaxRegimeOptions,
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  taxRegime: TaxRegime | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Integration record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  // Relations
  @WorkspaceRelation({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.invoices,
    type: RelationType.ONE_TO_MANY,
    label: msg`Invoices`,
    description: msg`Integration linked to the Invoices`,
    icon: 'IconFileDollar',
    inverseSideTarget: () => InvoiceWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  invoices: Relation<InvoiceWorkspaceEntity[]> | null;

  @WorkspaceField({
    standardId: FOCUS_NFE_STANDARD_FIELD_ID.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_INTEGRATION,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
