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
        return t`Pre-paid`;
      case BillingModel.Postpaid:
        return t`Post-paid`;
      case BillingModel.PrepaidUnlimited:
        return t`Pre-unlimited`;
      case BillingModel.PostpaidUnlimited:
        return t`Post-unlimited`;
      default:
        return value as string;
    }
  };

  const getBillingModelOptions = (): SelectOption<BillingModel>[] => [
    { label: t`Pre-paid`, value: BillingModel.Prepaid },
    { label: t`Post-paid`, value: BillingModel.Postpaid },
    { label: t`Pre-unlimited`, value: BillingModel.PrepaidUnlimited },
    { label: t`Post-unlimited`, value: BillingModel.PostpaidUnlimited },
  ];

  return {
    getBillingModelLabel,
    getBillingModelOptions,
  };
};
