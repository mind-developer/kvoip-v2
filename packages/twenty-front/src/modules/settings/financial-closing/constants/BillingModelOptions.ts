import { useLingui } from "@lingui/react/macro";

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

// Hook para traduções do BillingModel
export const useBillingModelTranslations = () => {
  const { t } = useLingui();

  const getBillingModelLabel = (value: BillingModel | string): string => {
    switch (value) {
      case BillingModel.Prepaid:
        return t`Pré-Pago`;
      case BillingModel.Postpaid:
        return t`Pós-Pago`;
      case BillingModel.PrepaidUnlimited:
        return t`Pré-Ilimitado`;
      case BillingModel.PostpaidUnlimited:
        return t`Pós-Ilimitado`;
      default:
        return value as string;
    }
  };

  const getBillingModelOptions = (): SelectOption<BillingModel>[] => [
    { label: t`Pré-Pago`, value: BillingModel.Prepaid },
    { label: t`Pós-Pago`, value: BillingModel.Postpaid },
    { label: t`Pré-Ilimitado`, value: BillingModel.PrepaidUnlimited },
    { label: t`Pós-Ilimitado`, value: BillingModel.PostpaidUnlimited },
  ];

  return {
    getBillingModelLabel,
    getBillingModelOptions,
  };
};
