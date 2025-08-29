import { ServiceFn } from 'src/engine/utils/generics';
import { CreateTelephonyInput } from 'src/modules/telephony/dtos/create-telephony.input';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';

export type CreateTelephonyArgs = CreateTelephonyInput;

export type CreateTelephonyResult = TelephonyWorkspaceEntity;

export type CreateTelephonyHandler = ServiceFn<
  Promise<CreateTelephonyResult>,
  CreateTelephonyArgs
>;
