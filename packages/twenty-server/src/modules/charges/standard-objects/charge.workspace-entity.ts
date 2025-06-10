import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CHARGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { IntegrationWorkspaceEntity } from 'src/modules/integrations/standard-objects/integration.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { NfType, NfTypeOptions } from 'src/modules/charges/types/NfType';
import { NfStatus, NfStatusOptions } from 'src/modules/charges/types/NfStatus';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CHARGE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.charge,
  namePlural: 'charges',
  labelSingular: msg`Charge`,
  labelPlural: msg`Charges`,
  description: msg`A charge`,
  icon: 'IconSettings',
  labelIdentifierStandardId: CHARGE_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
export class ChargeWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Charge product`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.nfType,
    type: FieldMetadataType.SELECT,
    label: msg`NF Type`,
    description: msg`NF Type`,
    icon: 'IconTag',
    options: NfTypeOptions,
  })
  @WorkspaceIsNullable()
  nfType: NfType | null;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.price,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Amount`,
    description: msg`Total Amount`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  price: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.percentNfe,
    type: FieldMetadataType.NUMBER,
    label: msg`% NF-e`,
    description: msg`Percentage for Nota Fiscal Eletrônica (Electronic Invoice for Products)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfe: number | null;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.percentNfse,
    type: FieldMetadataType.NUMBER,
    label: msg`% NFS-e`,
    description: msg`Percentage for Nota Fiscal de Serviços Eletrônica (Electronic Service Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfse: number | null;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.percentNfce,
    type: FieldMetadataType.NUMBER,
    label: msg`% NFC-e`,
    description: msg`Percentage for Nota Fiscal ao Consumidor Eletrônica (Electronic Consumer Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfce: number | null;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.percentNfcom,
    type: FieldMetadataType.NUMBER,
    label: msg`% NF-Com`,
    description: msg`Percentage for Nota Fiscal de Comunicação (Communication Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfcom: number | null;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.cfop,
    type: FieldMetadataType.TEXT,
    label: msg`CFOP`,
    description: msg`Código Fiscal de Operações. Placeholder: 5102`,
    icon: 'IconFileCode',
  })
  @WorkspaceIsNullable()
  cfop: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.cstIcmsCsosn,
    type: FieldMetadataType.TEXT,
    label: msg`CST/CSOSN`,
    description: msg`Código da Situação Tributária ou CSOSN. Placeholder: 102`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstIcmsCsosn: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.unitOfMeasure,
    type: FieldMetadataType.TEXT,
    label: msg`Unit`,
    description: msg`Product unit of measure (e.g., kg, unit, liter)`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  unitOfMeasure: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.origem,
    type: FieldMetadataType.NUMBER,
    label: msg`Origem da Mercadoria`,
    description: msg`Origem da mercadoria (0-8). Placeholder: 0`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  origem: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.aliquotaIcms,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ICMS (%)`,
    description: msg`Alíquota do ICMS. Placeholder: 18.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaIcms: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.aliquotaPis,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota PIS (%)`,
    description: msg`Alíquota do PIS. Placeholder: 1.65`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaPis: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.aliquotaCofins,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota COFINS (%)`,
    description: msg`Alíquota do COFINS. Placeholder: 7.60`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaCofins: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.aliquotaIpi,
    type: FieldMetadataType.NUMBER,
    label: msg`Valor/Alíquota IPI`,
    description: msg`Valor ou alíquota de IPI (se aplicável). Placeholder: 0.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaIpi: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.aliquotaIss,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ISS`,
    description: msg`Valor ou alíquota de ISS (se aplicável). Placeholder: 0.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaIss: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.nfStatus,
    type: FieldMetadataType.SELECT,
    label: msg`NF Status`,
    description: msg`NF Status`,
    icon: 'IconProgress',
    options: NfStatusOptions,
  })
  @WorkspaceIsNullable()
  nfStatus: NfStatus | null;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.discriminacao,
    type: FieldMetadataType.TEXT,
    label: msg`Discriminação`,
    description: msg`Discriminação dos serviços.`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  discriminacao: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.issRetido,
    type: FieldMetadataType.BOOLEAN,
    label: msg`ISS Retido`,
    description: msg`Informar true (verdadeiro) ou false (falso) se o ISS foi retido`,
    icon: 'IconTag',
    defaultValue: false,
  })
  @WorkspaceFieldIndex()
  issRetido: boolean;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.itemListaServico,
    type: FieldMetadataType.TEXT,
    label: msg`Item Lista Serviço`,
    description: msg`Informar o código da lista de serviços, normalmente de acordo com a Lei Complementar 116/2003.`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  itemListaServico: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.codigoTributarioMunicipio,
    type: FieldMetadataType.TEXT,
    label: msg`Código Tributário Município`,
    description: msg`Informar o código tributário de acordo com a tabela de cada município (não há um padrão).`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  codigoTributarioMunicipio: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.discount,
    type: FieldMetadataType.NUMBER,
    label: msg`Discount`,
    description: msg`Charge discount`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  discount: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.requestCode,
    type: FieldMetadataType.TEXT,
    label: msg`Request Code`,
    description: msg`Charge request code`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  requestCode: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.recurrence,
    type: FieldMetadataType.SELECT,
    label: msg`Recurrence`,
    description: msg`Charge recurrence`,
    icon: 'IconSettings',
    options: [
      { value: 'None', label: 'None', position: 0, color: 'gray' },
      { value: 'Annual', label: 'Annual', position: 1, color: 'gray' },
      {
        value: 'Monthly',
        label: 'Monthly',
        position: 2,
        color: 'gray',
      },
    ],
  })
  @WorkspaceIsNullable()
  recurrence: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.taxId,
    type: FieldMetadataType.TEXT,
    label: msg`Tax ID`,
    description: msg`CPF or CNPJ identifier for the charge`,
    icon: 'IconId',
  })
  @WorkspaceIsNullable()
  taxId: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.entityType,
    type: FieldMetadataType.SELECT,
    label: msg`Entity Type`,
    description: msg`Indicates if the entity is an individual or a company`,
    icon: 'IconUserCheck',
    options: [
      { value: 'individual', label: 'Individual', position: 0, color: 'blue' },
      { value: 'company', label: 'Company', position: 1, color: 'green' },
    ],
  })
  @WorkspaceIsNullable()
  entityType: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Charge record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.chargeAction,
    type: FieldMetadataType.SELECT,
    label: msg`Charge Action`,
    description: msg`Product charge action(issue products can be used in charges)`,
    icon: 'IconProgress',
    options: [
      { value: 'none', label: 'None', position: 0, color: 'gray' },
      { value: 'issue', label: 'Issue', position: 1, color: 'green' },
      { value: 'cancel', label: 'Cancel', position: 2, color: 'red' },
    ],
    defaultValue: "'none'",
  })
  @WorkspaceFieldIndex()
  chargeAction: string;

  // Relations
  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Company linked to the charge`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'charges',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.product,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Product linked to this charge`,
    icon: 'IconClipboardList',
    inverseSideTarget: () => ProductWorkspaceEntity,
    inverseSideFieldKey: 'charges',
  })
  @WorkspaceIsNullable()
  product: Relation<ProductWorkspaceEntity> | null;

  @WorkspaceJoinColumn('product')
  productId: string | null;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.integration,
    type: RelationType.MANY_TO_ONE,
    label: msg`Payment Gateway`,
    description: msg`Integration linked to the charge`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => IntegrationWorkspaceEntity,
    inverseSideFieldKey: 'charge',
  })
  @WorkspaceIsNullable()
  integration: Relation<IntegrationWorkspaceEntity> | null;

  @WorkspaceJoinColumn('integration')
  integrationId: string | null;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Contact`,
    description: msg`Person linked to the charge`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'charge',
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the charge`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the charge`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_CHARGE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
