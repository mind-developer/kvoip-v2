import { ServiceFn } from 'src/engine/utils/generics';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';

export type GetOneTelephonyArgs = {
  id: string;
  workspaceId: string;
};

export type FindOneTelephonyHandler = ServiceFn<
  Promise<TelephonyWorkspaceEntity | null>,
  GetOneTelephonyArgs
>;
