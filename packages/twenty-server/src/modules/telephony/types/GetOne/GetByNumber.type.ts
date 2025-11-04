import { ServiceFn } from 'src/engine/utils/generics';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';

export type GetTelephonyByNumberArgs = {
  numberExtension: string;
  workspaceId: string;
};

export type GetTelephonyByNumberHandler = ServiceFn<
  Promise<TelephonyWorkspaceEntity | null>,
  GetTelephonyByNumberArgs
>;


