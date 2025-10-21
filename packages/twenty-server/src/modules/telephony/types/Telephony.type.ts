import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TelephonyFullName {
  @Field(() => String, { nullable: true })
  firstName?: string | null;

  @Field(() => String, { nullable: true })
  lastName?: string | null;
}

@ObjectType()
export class TelephonyMember {
  @Field(() => String, { nullable: false })
  id: string;

  @Field(() => TelephonyFullName, { nullable: true })
  name?: TelephonyFullName | null;

  @Field(() => String, { nullable: true })
  userEmail?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => String, { nullable: true })
  userId?: string | null;

  @Field(() => String, { nullable: true })
  timeZone?: string | null;

  @Field(() => String, { nullable: true })
  dateFormat?: string | null;

  @Field(() => String, { nullable: true })
  timeFormat?: string | null;

  @Field(() => String, { nullable: true })
  calendarStartDay?: string | null;
}

@ObjectType()
export class TelephonyData {
  @Field(() => String, { nullable: false })
  id: string;

  @Field(() => String, { nullable: true })
  memberId?: string | null;

  @Field(() => TelephonyMember, { nullable: true })
  member?: TelephonyMember | null;

  @Field(() => String, { nullable: false })
  numberExtension: string;

  @Field(() => String, { nullable: true })
  extensionName?: string | null;

  @Field(() => String, { nullable: true })
  extensionGroup?: string | null;

  @Field(() => String, { nullable: true })
  type?: string | null;

  @Field(() => String, { nullable: true })
  dialingPlan?: string | null;

  @Field(() => String, { nullable: true })
  areaCode?: string | null;

  @Field(() => String, { nullable: true })
  SIPPassword?: string | null;

  @Field(() => String, { nullable: true })
  callerExternalID?: string | null;

  @Field(() => String, { nullable: true })
  pullCalls?: string | null;

  @Field(() => Boolean, { nullable: true })
  listenToCalls?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  recordCalls?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  blockExtension?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  enableMailbox?: boolean | null;

  @Field(() => String, { nullable: true })
  emailForMailbox?: string | null;

  @Field(() => String, { nullable: true })
  fowardAllCalls?: string | null;

  @Field(() => String, { nullable: true })
  fowardBusyNotAvailable?: string | null;

  @Field(() => String, { nullable: true })
  fowardOfflineWithoutService?: string | null;

  @Field(() => String, { nullable: true })
  extensionAllCallsOrOffline?: string | null;

  @Field(() => String, { nullable: true })
  externalNumberAllCallsOrOffline?: string | null;

  @Field(() => String, { nullable: true })
  destinyMailboxAllCallsOrOffline?: string | null;

  @Field(() => String, { nullable: true })
  extensionBusy?: string | null;

  @Field(() => String, { nullable: true })
  externalNumberBusy?: string | null;

  @Field(() => String, { nullable: true })
  destinyMailboxBusy?: string | null;

  @Field(() => String, { nullable: true })
  ramal_id?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding1?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding2?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding3?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding4?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding5?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding1Value?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding2Value?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding3Value?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding4Value?: string | null;

  @Field(() => String, { nullable: true })
  advancedFowarding5Value?: string | null;

  @Field(() => String, { nullable: true })
  createdAt?: string;

  @Field(() => String, { nullable: true })
  updatedAt?: string;
}
