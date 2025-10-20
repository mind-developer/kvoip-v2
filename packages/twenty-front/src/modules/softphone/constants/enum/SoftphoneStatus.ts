/* @kvoip-woulz proprietary */
import { useLingui } from "@lingui/react/macro";

export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export enum SoftphoneStatus {
  Online = 'online',
  Registering = 'registering',
  Offline = 'offline',
}

// Hook para traduções do SoftphoneStatus
export const useSoftphoneStatusTranslations = () => {
  const { t } = useLingui();

  const getStatusLabel = (value: SoftphoneStatus | string): string => {
    switch (value) {
      case SoftphoneStatus.Online:
        return t`Online`;
      case SoftphoneStatus.Registering:
        return t`Registering`;
      case SoftphoneStatus.Offline:
        return t`Offline`;
      default:
        return value as string;
    }
  };

  const getStatusOptions = (): SelectOption<SoftphoneStatus>[] => [
    { label: t`Online`, value: SoftphoneStatus.Online },
    { label: t`Registering`, value: SoftphoneStatus.Registering },
    { label: t`Offline`, value: SoftphoneStatus.Offline },
  ];

  return {
    getStatusLabel,
    getStatusOptions,
  };
};
