import { ServiceFn } from 'src/engine/utils/generics';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';

export type GetTelephonyByMemberArgs = {
  memberId: string;
  workspaceId: string;
};

export type GetTelephonyByMemberHandler = ServiceFn<
  Promise<TelephonyWorkspaceEntity | null>,
  GetTelephonyByMemberArgs
>;
