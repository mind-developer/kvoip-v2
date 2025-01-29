import { Field, ID, InputType, OmitType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateTelephonyInput {
  @Field(() => ID, { nullable: true })
  @Field(() => ID)
  @IsString()
  memberId: string;

  @Field(() => ID)
  @IsString()
  workspaceId: string;

  @Field(() => ID)
  @IsString()
  numberExtension: string;

  @Field({ nullable: true })
  @IsString()
  type: string;

  @Field({ nullable: true })
  @IsString()
  extensionName: string;

  @Field({ nullable: true })
  @IsString()
  extensionGroup: string;

  @Field({ nullable: true })
  @IsString()
  dialingPlan: string;

  @Field({ nullable: true })
  @IsString()
  areaCode: string;

  @Field({ nullable: true })
  @IsString()
  SIPPassword: string;

  @Field({ nullable: true })
  @IsString()
  callerExternalID: string;

  @Field({ nullable: true })
  @IsString()
  pullCalls: string;

  @Field({ nullable: true })
  listenToCalls: boolean;

  @Field({ nullable: true })
  recordCalls: boolean;

  @Field({ nullable: true })
  blockExtension: boolean;

  @Field({ nullable: true })
  enableMailbox: boolean;

  @Field({ nullable: true })
  @IsString()
  emailForMailbox: string;

  @Field({ nullable: true })
  @IsString()
  fowardAllCalls: string;

  @Field({ nullable: true })
  @IsString()
  fowardBusyNotAvailable: string;

  @Field({ nullable: true })
  @IsString()
  fowardOfflineWithoutService: string;

  @Field({ nullable: true })
  @IsString()
  extensionAllCallsOrOffline: string;

  @Field({ nullable: true })
  @IsString()
  externalNumberAllCallsOrOffline: string;

  @Field({ nullable: true })
  @IsString()
  destinyMailboxAllCallsOrOffline: string;

  @Field({ nullable: true })
  @IsString()
  extensionBusy: string;

  @Field({ nullable: true })
  @IsString()
  externalNumberBusy: string;

  @Field({ nullable: true })
  @IsString()
  destinyMailboxBusy: string;

  @Field({ nullable: true, defaultValue: '' })
  @IsString()
  ramal_id?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding1?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding2?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding3?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding4?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding5?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding1Value?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding2Value?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding3Value?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding4Value?: string;

  @Field({ nullable: true })
  @IsString()
  advancedFowarding5Value?: string;
}

@InputType()
export class UpdateTelephonyInput extends OmitType(CreateTelephonyInput, [
  'workspaceId',
] as const) {}
