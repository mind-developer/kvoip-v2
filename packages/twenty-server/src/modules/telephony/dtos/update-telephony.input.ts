import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateTelephonyInput {
  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field(() => ID)
  numberExtension?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  extensionName?: string;

  @Field({ nullable: true })
  extensionGroup?: string;

  @Field({ nullable: true })
  dialingPlan?: string;

  @Field({ nullable: true })
  areaCode?: string;

  @Field({ nullable: true })
  SIPPassword?: string;

  @Field({ nullable: true })
  callerExternalID?: string;

  @Field({ nullable: true })
  pullCalls?: string;

  @Field({ nullable: true })
  listenToCalls?: boolean;

  @Field({ nullable: true })
  recordCalls?: boolean;

  @Field({ nullable: true })
  blockExtension?: boolean;

  @Field({ nullable: true })
  enableMailbox?: boolean;

  @Field({ nullable: true })
  emailForMailbox?: string;

  @Field({ nullable: true })
  fowardAllCalls?: string;

  @Field({ nullable: true })
  fowardBusyNotAvailable?: string;

  @Field({ nullable: true })
  fowardOfflineWithoutService?: string;

  @Field({ nullable: true })
  extensionAllCallsOrOffline?: string;

  @Field({ nullable: true })
  externalNumberAllCallsOrOffline?: string;

  @Field({ nullable: true })
  destinyMailboxAllCallsOrOffline?: string;

  @Field({ nullable: true })
  extensionBusy?: string;

  @Field({ nullable: true })
  externalNumberBusy?: string;

  @Field({ nullable: true })
  destinyMailboxBusy?: string;

  @Field({ nullable: true })
  ramal_id?: string;

  @Field({ nullable: true })
  advancedFowarding1?: string;

  @Field({ nullable: true })
  advancedFowarding2?: string;

  @Field({ nullable: true })
  advancedFowarding3?: string;

  @Field({ nullable: true })
  advancedFowarding4?: string;

  @Field({ nullable: true })
  advancedFowarding5?: string;

  @Field({ nullable: true })
  advancedFowarding1Value?: string;

  @Field({ nullable: true })
  advancedFowarding2Value?: string;

  @Field({ nullable: true })
  advancedFowarding3Value?: string;

  @Field({ nullable: true })
  advancedFowarding4Value?: string;

  @Field({ nullable: true })
  advancedFowarding5Value?: string;
}
