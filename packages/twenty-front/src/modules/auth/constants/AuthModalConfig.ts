import {
  type ModalSize,
  type ModalVariants,
} from '@/ui/layout/modal/components/Modal';
import { AppPath } from 'twenty-shared/types';

type AuthModalConfigType = {
  size: ModalSize;
  variant: ModalVariants;
  showScrollWrapper: boolean;
};

export const AUTH_MODAL_CONFIG: {
  default: AuthModalConfigType;
  [key: string]: AuthModalConfigType;
} = {
  default: {
    size: 'medium',
    variant: 'primary',
    showScrollWrapper: true,
  },
  [AppPath.PlanRequired]: {
    size: 'large',
    variant: 'primary',
    showScrollWrapper: false,
  },
  [AppPath.BookCall]: {
    size: 'extraLarge',
    variant: 'primary',
    showScrollWrapper: false,
  },
  /* @kvoip-woulz proprietary:begin */
  [AppPath.Recharge]: {
    size: 'large',
    variant: 'primary',
    showScrollWrapper: true,
  },
  /* @kvoip-woulz proprietary:end */
};
