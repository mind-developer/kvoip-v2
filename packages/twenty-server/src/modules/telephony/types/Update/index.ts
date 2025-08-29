import { ServiceFn } from 'src/engine/utils/generics';
import { UpdateTelephonyInput } from 'src/modules/telephony/dtos/update-telephony.input';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';

export type UpdateTelephonyArgs = {
  id: string;
  data: UpdateTelephonyInput;
};

export type UpdateTelephonyResult = TelephonyWorkspaceEntity;

export type UpdateTelephonyHandler = ServiceFn<
  Promise<UpdateTelephonyResult>,
  UpdateTelephonyArgs
>;
