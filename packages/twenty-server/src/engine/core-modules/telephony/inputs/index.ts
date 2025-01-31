import { Field, ID, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateTelephonyInput {
  @Field(() => ID, { nullable: true })
  @IsString()
  memberId: string;

  @Field(() => ID)
  @IsString()
  workspaceId: string;

  @Field(() => ID)
  @IsString()
  numberExtension: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  type: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  extensionName: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  extensionGroup: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  dialingPlan: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  areaCode: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  SIPPassword: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  callerExternalID: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  pullCalls: string;

  @Field({ nullable: true, defaultValue: false })
  listenToCalls: boolean;

  @Field({ nullable: true, defaultValue: false })
  recordCalls: boolean;

  @Field({ nullable: true, defaultValue: false })
  blockExtension: boolean;

  @Field({ nullable: true, defaultValue: false })
  enableMailbox: boolean;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  emailForMailbox: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  fowardAllCalls: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  fowardBusyNotAvailable: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  fowardOfflineWithoutService: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  extensionAllCallsOrOffline: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  externalNumberAllCallsOrOffline: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  destinyMailboxAllCallsOrOffline: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  extensionBusy: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  externalNumberBusy: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  destinyMailboxBusy: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  ramal_id?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding1?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding2?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding3?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding4?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding5?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding1Value?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding2Value?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding3Value?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding4Value?: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  advancedFowarding5Value?: string;
}

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
