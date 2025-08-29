import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';

import {
  COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FINANCIAL_CLOSING_EXECUTION_MODEL_OPTIONS } from 'src/modules/financial-closing-execution/constants/financial-closing-execution-status.constants';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { Relation } from 'typeorm';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { FinancialClosingExecutionWorkspaceEntity } from 'src/modules/financial-closing-execution/standard-objects/financial-closing-execution.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_COMPANY_FINANCIAL_CLOSING_EXECUTION: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.companyFinancialClosingExecution,
  namePlural: 'companyFinancialClosingExecutions',
  labelSingular: msg`Company Financial Closing Execution`,
  labelPlural: msg`Company Financial Closing Executions`,
  description: msg`Execution logs for financial closings by company`,
  icon: 'IconBuilding',
  labelIdentifierStandardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CompanyFinancialClosingExecutionWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Execution Name`,
    description: msg`The name of the company financial closing execution`,
    icon: 'IconText',
  })
  name: string;

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.executedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Executed At`,
    description: msg`Date and time of execution`,
    icon: 'IconClock',
  })
  executedAt: Date;

  // @WorkspaceRelation({
  //   standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.financialClosingExecutionId,
  //   type: 'many-to-one',
  //   target: () => FinancialClosingExecutionWorkspaceEntity,
  //   onDelete: 'CASCADE',
  // })
  // financialClosingExecutionId: string;

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Execution status (pending, running, success, failed)`,
    icon: 'IconCheck',
    options: FINANCIAL_CLOSING_EXECUTION_MODEL_OPTIONS,
    defaultValue: "'PENDING'",
  })
  status: string;

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.companyId,
    type: FieldMetadataType.TEXT,
    label: msg`Company ID`,
    description: msg`Reference to the company`,
    icon: 'IconBuilding',
  })
  companyId: string;

  // @WorkspaceRelation({
  //   standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.financialClosingExecutionId,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Financial Closing Execution`,
  //   description: msg`Reference to the global financial closing execution this belongs to`,
  //   icon: 'IconCalendarTime',
  //   inverseSideTarget: () => FinancialClosingExecutionWorkspaceEntity,
  //   onDelete: RelationOnDeleteAction.CASCADE,
  // })
  // financialClosingExecution: Relation<FinancialClosingExecutionWorkspaceEntity>;

  // @WorkspaceRelation({
  //   standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.companyId,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Company`,
  //   description: msg`Reference to the company linked to this execution`,
  //   icon: 'IconBuilding',
  //   inverseSideTarget: () => CompanyWorkspaceEntity,
  //   onDelete: RelationOnDeleteAction.CASCADE,
  // })
  // company: Relation<CompanyWorkspaceEntity>;

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.chargeValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Charge Value`,
    description: msg`The amount to be charged to the company`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  chargeValue: number;

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.calculatedChargeValue,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Calculated Charge Value`,
    description: msg`Whether the charge value was successfully calculated`,
    icon: 'IconCalculator',
    defaultValue: false,
  })
  calculatedChargeValue: boolean;

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.completedBoletoIssuance,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Completed Boleto Issuance`,
    description: msg`Whether boleto issuance step completed`,
    icon: 'IconReceipt',
    defaultValue: false,
  })
  completedBoletoIssuance: boolean;

  // @WorkspaceField({
  //   standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.invoiceEmissionType,
  //   type: FieldMetadataType.SELECT,
  //   label: msg`Invoice Emission Type`,
  //   description: msg`The type of invoice emission`,
  //   icon: 'IconFileText',
  //   options: [
  //     { value: 'NFSE', label: msg`NFSe` },
  //     { value: 'NFCOM', label: msg`NFCom` },
  //     { value: 'OUTRO', label: msg`Outro` },
  //   ],
  // })
  // @WorkspaceIsNullable()
  // invoiceEmissionType: string;
  
  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.completedInvoiceIssuance,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Completed Invoice Issuance`,
    description: msg`Whether invoice issuance step completed`,
    icon: 'IconFileText',
    defaultValue: false,
  })
  completedInvoiceIssuance: boolean;

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.logs,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Execution Logs`,
    description: msg`Logs for this company execution`,
    icon: 'IconAlertCircle',
  })
  @WorkspaceIsNullable()
  logs: {
    level: 'error' | 'warn' | 'info';
    message: string;
    timestamp: string;
  }[];

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_COMPANY_FINANCIAL_CLOSING_EXECUTION,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
