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
import { Relation } from 'typeorm';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { FinancialClosingExecutionWorkspaceEntity } from 'src/modules/financial-closing-execution/standard-objects/financial-closing-execution.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { TYPE_EMISSION_NF_OPTIONS } from 'src/engine/core-modules/financial-closing/constants/type-emission-nf.constants';

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

  @WorkspaceRelation({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.financialClosingExecution,
    type: RelationType.MANY_TO_ONE,
    label: msg`Financial Closing Execution`,
    description: msg`Reference to the financial closing execution`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => FinancialClosingExecutionWorkspaceEntity,
    inverseSideFieldKey: 'companyFinancialClosingExecutions',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  financialClosingExecution: Relation<FinancialClosingExecutionWorkspaceEntity> | null;

  @WorkspaceJoinColumn('financialClosingExecution')
  financialClosingExecutionId: string | null;

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

  // @WorkspaceField({
  //   standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.companyId,
  //   type: FieldMetadataType.TEXT,
  //   label: msg`Company ID`,
  //   description: msg`Reference to the company`,
  //   icon: 'IconBuilding',
  // })
  // companyId: string;

  @WorkspaceRelation({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Reference to the company`,
    icon: 'IconBuilding',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'companyFinancialClosingExecutions',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

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

  @WorkspaceField({
    standardId: COMPANY_FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.invoiceEmissionType,
    type: FieldMetadataType.SELECT,
    label: msg`Invoice Emission Type`,
    description: msg`The type of invoice emission`,
    icon: 'IconNote',
    options: TYPE_EMISSION_NF_OPTIONS,
  })
  @WorkspaceIsNullable()
  invoiceEmissionType: string | null;

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
}
