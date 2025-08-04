export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export enum BillingModel {
  Prepaid = 'PREPAID',
  Postpaid = 'POSTPAID',
  PrepaidUnlimited = 'PREPAID_UNLIMITED',
  PostpaidUnlimited = 'POSTPAID_UNLIMITED',
}

export const BillingModelOptions: SelectOption<BillingModel>[] = [
  { label: 'Pré-Pago', value: BillingModel.Prepaid },
  { label: 'Pós-Pago', value: BillingModel.Postpaid },
  { label: 'Pré-Ilimitado', value: BillingModel.PrepaidUnlimited },
  { label: 'Pós-Ilimitado', value: BillingModel.PostpaidUnlimited },
];

const billingModelLabelMap = new Map(
  BillingModelOptions.map(option => [option.value, option.label])
);

export function getBillingModelLabel(value: BillingModel | string): string | undefined {
  return billingModelLabelMap.get(value as BillingModel);
}