import { AxiosResponse } from 'axios';

import { CreateDialingPlanInput } from 'src/modules/telephony/dtos/create-dialing-plan.input';
import { UpdateRoutingRulesInput } from 'src/modules/telephony/dtos/update-routing-rules.input';
import { InsereEmpresa } from 'src/modules/telephony/types/Create/InsereEmpresa.type';
import { InsereTronco } from 'src/modules/telephony/types/Create/InsereTronco.type';
import { ExtetionBody } from 'src/modules/telephony/types/Extention.type';
import {
  ListCommonArgs,
  ListExtentionsArgs,
} from 'src/modules/telephony/types/pabx.type';

export interface PabxServiceInterface {
  createExtention: (data: ExtetionBody) => Promise<AxiosResponse>;
  updateExtention: (data: ExtetionBody) => Promise<AxiosResponse>;
  listExtentions: (args?: ListExtentionsArgs) => Promise<AxiosResponse>;
  listDialingPlans: (args: ListCommonArgs) => Promise<AxiosResponse>;
  listDids: (args: ListCommonArgs) => Promise<AxiosResponse>;
  listCampaigns: (args: ListCommonArgs) => Promise<AxiosResponse>;
  listIntegrationFlows: (args: ListCommonArgs) => Promise<AxiosResponse>;
  createCompany: (data: InsereEmpresa) => Promise<AxiosResponse>;
  createTrunk: (data: InsereTronco) => Promise<AxiosResponse>;
  createDialingPlan: (data: CreateDialingPlanInput) => Promise<AxiosResponse>;
  updateRoutingRules: (data: UpdateRoutingRulesInput) => Promise<AxiosResponse>;
}
