import { ServiceFn } from 'src/engine/utils/generics';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';

export type GetAllTelephonyArgs = {
  workspaceId: string;
};

export type GetAllTelephonyHandler = ServiceFn<
  Promise<TelephonyWorkspaceEntity[]>,
  GetAllTelephonyArgs
>;
