import { Field, ID, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

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

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  extensionName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  extensionGroup?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  dialingPlan?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  areaCode?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  SIPPassword?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  callerExternalID?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  pullCalls?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  listenToCalls?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  recordCalls?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  blockExtension?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  enableMailbox?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  emailForMailbox?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fowardAllCalls?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fowardBusyNotAvailable?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fowardOfflineWithoutService?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  extensionAllCallsOrOffline?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  externalNumberAllCallsOrOffline?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  destinyMailboxAllCallsOrOffline?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  extensionBusy?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  externalNumberBusy?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  destinyMailboxBusy?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ramal_id?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding1?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding2?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding3?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding4?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding5?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding1Value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding2Value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding3Value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding4Value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding5Value?: string;
}
