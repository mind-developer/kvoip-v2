import { CreateTelephonyInput } from 'src/modules/telephony/dtos/create-telephony.input';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceFn<R, A extends any[]> = (...args: A) => R;

export type CreateTelephonyArgs = CreateTelephonyInput;

export type CreateTelephonyResult = TelephonyWorkspaceEntity;

export type CreateTelephonyHandler = ServiceFn<
  Promise<CreateTelephonyResult>,
  [CreateTelephonyInput, string]
>;
