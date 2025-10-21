import { Field, ObjectType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { TEXT_VALIDATION_PATTERNS } from 'twenty-shared/utils';
import { Column } from 'typeorm';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { TELEPHONY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

const MEMBER_ID_FIELD = 'memberId';

export const SEARCH_FIELDS_FOR_TELEPHONY: FieldTypeAndNameMetadata[] = [
  { name: MEMBER_ID_FIELD, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.telephony,
  namePlural: 'Telephonies',
  labelSingular: msg`Telephony`,
  labelPlural: msg`Telephonies`,
  description: msg`A telephony integration`,
  icon: 'IconHeadset',
  labelIdentifierStandardId: TELEPHONY_STANDARD_FIELD_IDS.memberId,
})
@WorkspaceIsSearchable()
@WorkspaceIsSystem()
@ObjectType()
export class TelephonyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.memberId,
    type: FieldMetadataType.TEXT,
    label: msg`Member ID`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_MEMBER_ID,
    },
  })
  @Column({ unique: true })
  @Field(() => String, { nullable: false })
  memberId: string;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.numberExtension,
    type: FieldMetadataType.TEXT,
    label: msg`Number Extension`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_EXTENSION_NUMBER,
    },
  })
  @Column({ unique: true })
  @Field(() => String, { nullable: false })
  numberExtension: string;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.extensionName,
    type: FieldMetadataType.TEXT,
    label: msg`Extension name`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_EXTENSION_NAME,
    },
  })
  @Field(() => String, { nullable: true })
  extensionName: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.extensionGroup,
    type: FieldMetadataType.TEXT,
    label: msg`Extension Group`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_EXTENSION_GROUP,
    },
  })
  @Field(() => String, { nullable: true })
  extensionGroup: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: msg`Type`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_TYPE,
    },
  })
  @Field(() => String, { nullable: true })
  type: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.dialingPlan,
    type: FieldMetadataType.TEXT,
    label: msg`Dialing Plan`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_DIALING_PLAN,
    },
  })
  @Field(() => String, { nullable: true })
  dialingPlan: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.areaCode,
    type: FieldMetadataType.TEXT,
    label: msg`Area Code`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_AREA_CODE,
    },
  })
  @Field(() => String, { nullable: true })
  areaCode: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.SIPPassword,
    type: FieldMetadataType.TEXT,
    label: msg`SIP Password`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_SIP_PASSWORD,
    },
  })
  @Field(() => String, { nullable: true })
  SIPPassword: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.callerExternalID,
    type: FieldMetadataType.TEXT,
    label: msg`Caller External ID`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_CALLER_EXTERNAL_ID,
    },
  })
  @Field(() => String, { nullable: true })
  callerExternalID: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.pullCalls,
    type: FieldMetadataType.TEXT,
    label: msg`Pull Calls`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_PULL_CALLS,
    },
  })
  @Field(() => String, { nullable: true })
  pullCalls: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.listenToCalls,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Listen to Calls`,
  })
  @Field(() => Boolean, { nullable: true })
  listenToCalls: boolean | null = false;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.recordCalls,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Record Calls`,
  })
  @Field(() => Boolean, { nullable: true })
  recordCalls: boolean | null = false;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.blockExtension,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Block Extension`,
  })
  @Field(() => Boolean, { nullable: true })
  blockExtension: boolean | null = false;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.enableMailbox,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Enable Mailbox`,
  })
  @Field(() => Boolean, { nullable: true })
  enableMailbox: boolean | null = false;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.emailForMailbox,
    type: FieldMetadataType.TEXT,
    label: msg`Email for Mailbox`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_EMAIL_FOR_MAILBOX,
    },
  })
  @Field(() => String, { nullable: true })
  emailForMailbox: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.fowardAllCalls,
    type: FieldMetadataType.TEXT,
    label: msg`Foward All Calls`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  fowardAllCalls: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.fowardBusyNotAvailable,
    type: FieldMetadataType.TEXT,
    label: msg`Foward Busy not Available`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  fowardBusyNotAvailable: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.fowardOfflineWithoutService,
    type: FieldMetadataType.TEXT,
    label: msg`Foward Offline without Service`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  fowardOfflineWithoutService: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.extensionAllCallsOrOffline,
    type: FieldMetadataType.TEXT,
    label: msg`Extension All Calls or Offline`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  extensionAllCallsOrOffline: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.externalNumberAllCallsOrOffline,
    type: FieldMetadataType.TEXT,
    label: msg`External Number All Calls or Offline`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  externalNumberAllCallsOrOffline: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.destinyMailboxAllCallsOrOffline,
    type: FieldMetadataType.TEXT,
    label: msg`Destiny Mailbox All Calls or Offline`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  destinyMailboxAllCallsOrOffline: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.extensionBusy,
    type: FieldMetadataType.TEXT,
    label: msg`Extension Busy`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  extensionBusy: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.externalNumberBusy,
    type: FieldMetadataType.TEXT,
    label: msg`External Number Busy`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  externalNumberBusy: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.destinyMailboxBusy,
    type: FieldMetadataType.TEXT,
    label: msg`Destiny Mailbox Busy`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_FORWARD_NUMBER,
    },
  })
  @Field(() => String, { nullable: true })
  destinyMailboxBusy: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.ramal_id,
    type: FieldMetadataType.TEXT,
    label: msg`Ramal ID`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_RAMAL_ID,
    },
  })
  @Field(() => String, { nullable: true })
  ramal_id: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding1,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 1`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding1: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding2,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 2`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding2: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding3,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 3`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding3: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding4,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 4`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding4: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding5,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 5`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding5: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding1Value,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 1 Value`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING_VALUE,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding1Value: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding2Value,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 2 Value`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING_VALUE,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding2Value: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding3Value,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 3 Value`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING_VALUE,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding3Value: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding4Value,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 4 Value`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING_VALUE,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding4Value: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.advancedFowarding5Value,
    type: FieldMetadataType.TEXT,
    label: msg`Advanced Fowarding 5 Value`,
    settings: {
      validation: TEXT_VALIDATION_PATTERNS.TELEPHONY_ADVANCED_FORWARDING_VALUE,
    },
  })
  @Field(() => String, { nullable: true })
  advancedFowarding5Value: string | null;

  @WorkspaceField({
    standardId: TELEPHONY_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_TELEPHONY,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
