import { Field, ID, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

import { PabxCompanyCreationDetailsInput } from 'src/modules/telephony/dtos/pabx-company-creation-details.input';
import { PabxDialingPlanCreationDetailsInput } from 'src/modules/telephony/dtos/pabx-dialing-plan-creation-details.input';
import { PabxTrunkCreationDetailsInput } from 'src/modules/telephony/dtos/pabx-trunk-creation-details.input';
import { UpdateRoutingRulesDataInput } from 'src/modules/telephony/dtos/update-routing-rules-data.input';

@InputType()
export class SetupPabxEnvironmentInput {
  @Field(() => ID)
  @IsString()
  workspaceId: string;

  @Field(() => PabxCompanyCreationDetailsInput)
  companyDetails: PabxCompanyCreationDetailsInput;

  @Field(() => PabxTrunkCreationDetailsInput)
  trunkDetails: PabxTrunkCreationDetailsInput;

  @Field(() => PabxDialingPlanCreationDetailsInput)
  dialingPlanDetails: PabxDialingPlanCreationDetailsInput;

  @Field(() => UpdateRoutingRulesDataInput)
  routingRulesData: UpdateRoutingRulesDataInput;
}
