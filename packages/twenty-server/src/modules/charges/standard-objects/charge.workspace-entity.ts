import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
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
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CHARGE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum ChargeRecurrence {
  NONE = 'None',
  ANNUAL = 'Annual',
  MONTHLY = 'Monthly',
}

export enum ChargeAction {
  NONE = 'none',
  ISSUE = 'issue',
  CANCEL = 'cancel',
}

export enum ChargeEntityType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

registerEnumType(ChargeRecurrence, {
  name: 'ChargeRecurrence',
});

registerEnumType(ChargeAction, {
  name: 'ChargeAction',
});

registerEnumType(ChargeEntityType, {
  name: 'ChargeEntityType',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.charge,
  namePlural: 'charges',
  labelSingular: msg`Charge`,
  labelPlural: msg`Charges`,
  description: msg`A charge`,
  icon: 'IconSettings',
  labelIdentifierStandardId: CHARGE_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
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
    standardId: CHARGE_STANDARD_FIELD_IDS.price,
    type: FieldMetadataType.NUMBER,
    label: msg`Price`,
    description: msg`Charge price`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  price: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.quantity,
    type: FieldMetadataType.NUMBER,
    label: msg`Quantity`,
    description: msg`Charge quantity`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  quantity: number;

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
      {
        value: ChargeRecurrence.NONE,
        label: 'None',
        position: 0,
        color: 'gray',
      },
      {
        value: ChargeRecurrence.ANNUAL,
        label: 'Annual',
        position: 1,
        color: 'gray',
      },
      {
        value: ChargeRecurrence.MONTHLY,
        label: 'Monthly',
        position: 2,
        color: 'gray',
      },
    ],
  })
  @WorkspaceIsNullable()
  recurrence: ChargeRecurrence;

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
      {
        value: ChargeEntityType.INDIVIDUAL,
        label: 'Individual',
        position: 0,
        color: 'blue',
      },
      {
        value: ChargeEntityType.COMPANY,
        label: 'Company',
        position: 1,
        color: 'green',
      },
    ],
  })
  @WorkspaceIsNullable()
  entityType: ChargeEntityType;

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

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.chargeAction,
    type: FieldMetadataType.SELECT,
    label: msg`Charge Action`,
    description: msg`Product charge action(issue products can be used in charges)`,
    icon: 'IconProgress',
    options: [
      { value: ChargeAction.NONE, label: 'None', position: 0, color: 'gray' },
      {
        value: ChargeAction.ISSUE,
        label: 'Issue',
        position: 1,
        color: 'green',
      },
      {
        value: ChargeAction.CANCEL,
        label: 'Cancel',
        position: 2,
        color: 'red',
      },
    ],
    defaultValue: `'${ChargeAction.NONE}'`,
  })
  @WorkspaceFieldIndex()
  chargeAction: ChargeAction;

  //Relations
  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Customer`,
    description: msg`Customer linked to the charge`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'charges',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

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
    standardId: CHARGE_STANDARD_FIELD_IDS.notaFiscal,
    type: RelationType.ONE_TO_MANY,
    label: msg`Notas Fiscais`,
    description: msg`Notas fiscais using this charge`,
    icon: 'IconSettings',
    inverseSideTarget: () => NotaFiscalWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  notaFiscal: Relation<NotaFiscalWorkspaceEntity[]> | null;

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

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.companyFinancialClosingExecutions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Company Financial Closing Executions`,
    description: msg`Company Financial Closing Executions linked to the charge`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyFinancialClosingExecutionWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  companyFinancialClosingExecutions: Relation<CompanyFinancialClosingExecutionWorkspaceEntity[]> | null;

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
