import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { BILLING_MODEL_OPTIONS } from 'src/engine/core-modules/financial-closing/constants/billing-model.constants';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { FINANCIAL_CLOSING_EXECUTION_MODEL_OPTIONS } from 'src/modules/financial-closing-execution/constants/financial-closing-execution-status.constants';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.financialClosingExecution,
  namePlural: 'financialClosingExecutions',
  labelSingular: msg`Financial Closing Execution`,
  labelPlural: msg`Financial Closing Executions`,
  description: msg`Execution logs for financial closings`,
  icon: 'IconCalendarTime',
  labelIdentifierStandardId:
    FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class FinancialClosingExecutionWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Financial Closing Execution Name`,
    description: msg`The name of the financial closing execution`,
    icon: 'IconText',
  })
  name: string;

  @WorkspaceField({
    standardId: FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.executedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Executed At`,
    description: msg`Date and time of execution`,
    icon: 'IconClock',
  })
  executedAt: Date;

  @WorkspaceField({
    standardId:
      FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.financialClosingId,
    type: FieldMetadataType.TEXT,
    label: msg`Financial Closing ID`,
    description: msg`Reference to external financial closing`,
    icon: 'IconLink',
  })
  financialClosingId: string;

  @WorkspaceField({
    standardId: FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Execution status (pending, running, success, failed)`,
    icon: 'IconCheck',
    options: FINANCIAL_CLOSING_EXECUTION_MODEL_OPTIONS,
    defaultValue: "'PENDING'",
  })
  status: string;

  @WorkspaceField({
    standardId: FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.companiesTotal,
    type: FieldMetadataType.NUMBER,
    label: msg`Companies Total`,
    description: msg`Total number of companies processed`,
    icon: 'IconBuilding',
    defaultValue: 0,
  })
  companiesTotal: number;

  @WorkspaceField({
    standardId:
      FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.companiesWithError,
    type: FieldMetadataType.NUMBER,
    label: msg`Companies with Error`,
    description: msg`Number of companies with errors during execution`,
    icon: 'IconAlertTriangle',
    defaultValue: 0,
  })
  companiesWithError: number;

  @WorkspaceField({
    standardId:
      FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.completedCompanySearch,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Completed Company Search`,
    description: msg`Whether the company search step completed`,
    icon: 'IconSearch',
    defaultValue: false,
  })
  completedCompanySearch: boolean;

  @WorkspaceField({
    standardId:
      FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.completedCostIdentification,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Completed Cost Identification`,
    description: msg`Whether cost identification step completed`,
    icon: 'IconCurrencyDollar',
    defaultValue: false,
  })
  completedCostIdentification: boolean;

  @WorkspaceField({
    standardId:
      FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.completedBoletoIssuance,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Completed Boleto Issuance`,
    description: msg`Whether boleto issuance step completed`,
    icon: 'IconReceipt',
    defaultValue: false,
  })
  completedBoletoIssuance: boolean;

  @WorkspaceField({
    standardId:
      FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.completedInvoiceIssuance,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Completed Invoice Issuance`,
    description: msg`Whether invoice issuance step completed`,
    icon: 'IconFileText',
    defaultValue: false,
  })
  completedInvoiceIssuance: boolean;

  @WorkspaceField({
    standardId: FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.billingModel,
    type: FieldMetadataType.MULTI_SELECT,
    label: msg`Billing Models`,
    description: msg`Billing models linked to this execution`,
    icon: 'IconCreditCard',
    options: BILLING_MODEL_OPTIONS,
  })
  @WorkspaceIsNullable()
  billingModelIds: string[];

  @WorkspaceField({
    standardId: FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.logs, // cria esse ID no enum de fields
    type: FieldMetadataType.RAW_JSON,
    label: msg`Execution Logs`,
    description: msg`Error, warning or info logs during execution`,
    icon: 'IconAlertCircle',
  })
  @WorkspaceIsNullable()
  logs: {
    level: 'error' | 'warn' | 'info';
    message: string;
    timestamp: string;
  }[];

  @WorkspaceRelation({
    standardId:
      FINANCIAL_CLOSING_EXECUTION_STANDARD_FIELD_IDS.companyFinancialClosingExecutions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Company Financial Closing Executions`,
    description: msg`Reference to company financial closing executions`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyFinancialClosingExecutionWorkspaceEntity,
    inverseSideFieldKey: 'financialClosingExecution',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  companyFinancialClosingExecutions: Relation<
    CompanyFinancialClosingExecutionWorkspaceEntity[]
  >;
}
