export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export enum BillingModel {
  Prepaid = 'prepaid',
  Postpaid = 'postpaid',
  PrepaidUnlimited = 'prepaidUnlimited',
  PostpaidUnlimited = 'postpaidUnlimited',
}

export const BillingModelOptions: SelectOption<BillingModel>[] = [
  { label: 'Pré-pago', value: BillingModel.Prepaid },
  { label: 'Pós-pago', value: BillingModel.Postpaid },
  { label: 'Pré-Ilimitado', value: BillingModel.PrepaidUnlimited },
  { label: 'Pós-Ilimitado', value: BillingModel.PostpaidUnlimited },
];

const billingModelLabelMap = new Map(
  BillingModelOptions.map(option => [option.value, option.label])
);

export function getBillingModelLabel(value: BillingModel): string | undefined {
  return billingModelLabelMap.get(value);
}