import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { TEXT_VALIDATION_PATTERNS } from 'twenty-shared/utils';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BILLING_MODEL_OPTIONS } from 'src/engine/core-modules/financial-closing/constants/billing-model.constants';
import { TYPE_DISCOUNT_OPTIONS } from 'src/engine/core-modules/financial-closing/constants/type-discount.constants';
import { TYPE_EMISSION_NF_OPTIONS } from 'src/engine/core-modules/financial-closing/constants/type-emission-nf.constants';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { AddressMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/address.composite-type';
import { type CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { EmailsMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/emails.composite-type';
import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { FinancialRegisterWorkspaceEntity } from 'src/modules/financial-register/standard-objects/financial-register.workspace-entity';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';
import { TenantWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/tenant.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';
const DOMAIN_NAME_FIELD_NAME = 'domainName';
const CPF_CNPJ_FIELD_NAME = 'cpfCnpj';
const INSCRICAO_ESTADUAL_FIELD_NAME = 'inscricaoEstadual';
const EMAILS_FIELD_NAME = 'emails';

export const SEARCH_FIELDS_FOR_COMPANY: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: DOMAIN_NAME_FIELD_NAME, type: FieldMetadataType.LINKS },
  { name: CPF_CNPJ_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: INSCRICAO_ESTADUAL_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: EMAILS_FIELD_NAME, type: FieldMetadataType.EMAILS },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.company,
  namePlural: 'companies',
  labelSingular: msg`Company`,
  labelPlural: msg`Companies`,
  description: msg`A company`,
  icon: STANDARD_OBJECT_ICONS.company,
  shortcut: 'C',
  labelIdentifierStandardId: COMPANY_STANDARD_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['domainNamePrimaryLinkUrl']])
@WorkspaceIsSearchable()
export class CompanyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The company name`,
    icon: 'IconBuildingSkyscraper',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.COMPANY_NAME,
        errorMessage: msg`Add a company name`,
      },
    },
  })
  name: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.domainName,
    type: FieldMetadataType.LINKS,
    label: msg`Domain Name`,
    description: msg`The company website URL. We use this url to fetch the company icon`,
    icon: 'IconLink',
  })
  @WorkspaceIsUnique()
  domainName: LinksMetadata;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.employees,
    type: FieldMetadataType.NUMBER,
    label: msg`Employees`,
    description: msg`Number of employees in the company`,
    icon: 'IconUsers',
  })
  @WorkspaceIsNullable()
  employees: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.linkedinLink,
    type: FieldMetadataType.LINKS,
    label: msg`Linkedin`,
    description: msg`The company Linkedin account`,
    icon: 'IconBrandLinkedin',
  })
  @WorkspaceIsNullable()
  linkedinLink: LinksMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.xLink,
    type: FieldMetadataType.LINKS,
    label: msg`X`,
    description: msg`The company Twitter/X account`,
    icon: 'IconBrandX',
  })
  @WorkspaceIsNullable()
  xLink: LinksMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
    type: FieldMetadataType.CURRENCY,
    label: msg`Annual Recurring Revenue`,
    description: msg`Annual Recurring Revenue: The actual or estimated annual revenue of the company`,
    icon: 'IconMoneybag',
  })
  @WorkspaceIsNullable()
  annualRecurringRevenue: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.address,
    type: FieldMetadataType.ADDRESS,
    label: msg`Address`,
    description: msg`Address of the company`,
    icon: 'IconMap',
  })
  @WorkspaceIsNullable()
  address: AddressMetadata;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.idealCustomerProfile,
    type: FieldMetadataType.BOOLEAN,
    label: msg`ICP`,
    description: msg`Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you`,
    icon: 'IconTarget',
    defaultValue: false,
  })
  idealCustomerProfile: boolean;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Company record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.CPF_CNPJ,
    type: FieldMetadataType.TEXT,
    label: msg`CPF/CNPJ`,
    description: msg`Brazilian individual (CPF) or corporate (CNPJ) taxpayer registry ID`,
    icon: 'IconFileText',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CPF_CNPJ,
        errorMessage: msg`Use the format: 000.000.000-00 or 00.000.000/0000-00`,
      },
    },
  })
  @WorkspaceIsNullable()
  cpfCnpj: string | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.inscricaoMunicipal,
    type: FieldMetadataType.TEXT,
    label: msg`Municipal Registration`,
    description: msg`Municipal registration of the service provider`,
    icon: 'IconFileText',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.MUNICIPAL_REGISTRATION,
        errorMessage: msg`Use the format: 00000000-0`,
      },
    },
  })
  @WorkspaceIsNullable()
  inscricaoMunicipal: string | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.INSCRICAO_ESTADUAL,
    type: FieldMetadataType.TEXT,
    label: msg`State Registration`,
    description: msg`State Registration number for tax purposes in Brazil`,
    icon: 'IconFileText',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.STATE_REGISTRATION,
        errorMessage: msg`Use the format: 000.000.000.000`,
      },
    },
  })
  @WorkspaceIsNullable()
  inscricaoEstadual: string | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.PERCENT_NFE,
    type: FieldMetadataType.NUMBER,
    label: msg`% NF-e`,
    description: msg`Percentage for Eletronic Invoice (Electronic Invoice for Products)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfe: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.PERCENT_NFSE,
    type: FieldMetadataType.NUMBER,
    label: msg`% NFS-e`,
    description: msg`Percentage for Electronic Service Invoice (Electronic Service Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfse: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.PERCENT_NFCE,
    type: FieldMetadataType.NUMBER,
    label: msg`% NFC-e`,
    description: msg`Percentage for Electronic Consumer Invoice (Electronic Consumer Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfce: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.PERCENT_NFCOM,
    type: FieldMetadataType.NUMBER,
    label: msg`% NF-Com`,
    description: msg`Percentage for Communication Invoice (Communication Invoice)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  percentNfcom: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.emails,
    type: FieldMetadataType.EMAILS,
    label: msg`Emails`,
    description: msg`Contact’s Emails`,
    icon: 'IconMail',
  })
  @WorkspaceIsUnique()
  emails: EmailsMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.people,
    type: RelationType.ONE_TO_MANY,
    label: msg`People`,
    description: msg`People linked to the company.`,
    icon: 'IconUsers',
    inverseSideTarget: () => PersonWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  people: Relation<PersonWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.charge,
    type: RelationType.ONE_TO_MANY,
    label: msg`Charge`,
    description: msg`Company linked to the charge`,
    icon: 'IconReportMoney',
    inverseSideTarget: () => ChargeWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  charges: Relation<ChargeWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.product,
    type: RelationType.ONE_TO_MANY,
    label: msg`Products`,
    icon: 'IconClipboardList',
    inverseSideTarget: () => ProductWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  products: Relation<ProductWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the company account`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForCompanies',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.taskTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Tasks`,
    description: msg`Tasks tied to the company`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.noteTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Notes`,
    description: msg`Notes tied to the company`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.opportunities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Opportunities`,
    description: msg`Opportunities linked to the company.`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  opportunities: Relation<OpportunityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the company`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the company`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the company`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.invoices,
    type: RelationType.ONE_TO_MANY,
    label: msg`Invoices`,
    description: msg`Invoices to the company`,
    icon: 'IconFileDollar',
    inverseSideTarget: () => InvoiceWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  invoices: Relation<InvoiceWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.tenants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Workspace`,
    description: msg`Workspaces linked to the company.`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => TenantWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceGate({ featureFlag: 'IS_KVOIP_ADMIN' })
  @WorkspaceIsNullable()
  tenants: Relation<TenantWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.address_deprecated,
    type: FieldMetadataType.TEXT,
    label: msg`Address (deprecated) `,
    description: msg`Address of the company - deprecated in favor of new address field`,
    icon: 'IconMap',
  })
  @WorkspaceIsDeprecated()
  @WorkspaceIsNullable()
  addressOld: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_COMPANY,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.billingModel,
    type: FieldMetadataType.SELECT,
    label: msg`Billing Model`,
    description: msg`Defines how the company is billed: prepaid, postpaid, etc.`,
    icon: 'IconCreditCard',
    options: BILLING_MODEL_OPTIONS,
  })
  @WorkspaceIsNullable()
  billingModel: string | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.typeDiscount,
    type: FieldMetadataType.SELECT,
    label: msg`Type of Discount`,
    description: msg`Type of discount applied to the company - Percent or Value`,
    icon: 'IconFilePercent',
    options: TYPE_DISCOUNT_OPTIONS,
  })
  @WorkspaceIsNullable()
  typeDiscount: string | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.discount,
    type: FieldMetadataType.NUMBER,
    label: msg`Discount`,
    description: msg`Discount value, can be a percentage or fixed amount depending on the discount type`,
    icon: 'IconFlagDiscount',
  })
  @WorkspaceIsNullable()
  discount: number | null;

  @WorkspaceField({
    standardId:
      COMPANY_STANDARD_FIELD_IDS.quantitiesRemainingFinancialClosingsDiscounts,
    type: FieldMetadataType.NUMBER,
    label: msg`Quantity of Financial Closings Remaining for Discount`,
    description: msg`Number of financial closings remaining for this discount to be applied`,
    icon: 'IconCalendarStats',
  })
  @WorkspaceIsNullable()
  quantitiesRemainingFinancialClosingsDiscounts: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.totalValueCharged,
    type: FieldMetadataType.CURRENCY,
    label: msg`Total Value Charged`,
    description: msg`Total value charged to the company, in the selected currency`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  totalValueCharged: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.valueMinimumMonthly,
    type: FieldMetadataType.CURRENCY,
    label: msg`Minimum Monthly Cost`,
    description: msg`Minimum monthly cost for the company`,
    icon: 'IconCalendarDollar',
  })
  @WorkspaceIsNullable()
  valueMinimumMonthly: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.valueFixedMonthly,
    type: FieldMetadataType.CURRENCY,
    label: msg`Fixed Monthly Charge`,
    description: msg`Fixed monthly charge applied to the company`,
    icon: 'IconCash',
  })
  @WorkspaceIsNullable()
  valueFixedMonthly: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.slipDueDay,
    type: FieldMetadataType.NUMBER,
    label: msg`Due Day for Bank Slip`,
    description: msg`Due day for the company's bank slip (boleto) payments`,
    icon: 'IconCalendarDue',
  })
  @WorkspaceIsNullable()
  slipDueDay: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.cdrId,
    type: FieldMetadataType.TEXT,
    label: msg`CDR Integration ID`,
    description: msg`Unique identifier for CDR integration`,
    icon: 'IconFileText',
    settings: {
      validation: {
        ...TEXT_VALIDATION_PATTERNS.CDR_ID,
        errorMessage: msg`Use the format: xxx-000-xxx`,
      },
    },
  })
  @WorkspaceIsNullable()
  cdrId: string | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.typeEmissionNF,
    type: FieldMetadataType.SELECT,
    label: msg`Type of Invoice Emission`,
    description: msg`Type of invoice issuance, sets the time of issuance`,
    icon: 'IconNote',
    options: TYPE_EMISSION_NF_OPTIONS,
  })
  @WorkspaceIsNullable()
  typeEmissionNF: string | null;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.companyFinancialClosingExecutions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Company Financial Closing Executions`,
    description: msg`Reference to the company Financial Closing Executions`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyFinancialClosingExecutionWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  companyFinancialClosingExecutions: Relation<
    CompanyFinancialClosingExecutionWorkspaceEntity[]
  >;

  /* @kvoip-woulz proprietary:begin */
  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.financialRegisters,
    type: RelationType.ONE_TO_MANY,
    label: msg`Financial Registers`,
    description: msg`Financial registers (receivable and payable)`,
    icon: 'IconReceipt',
    inverseSideTarget: () => FinancialRegisterWorkspaceEntity,
    inverseSideFieldKey: 'company',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  financialRegisters: Relation<FinancialRegisterWorkspaceEntity[]> | null;
  /* @kvoip-woulz proprietary:end */
}
