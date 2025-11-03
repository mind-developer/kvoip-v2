import { type PlansQueryBillingBaseProduct } from '@/billing/types/planQueryBillingBaseProduct';
import { isBillingPriceLicensed } from '@/billing/utils/isBillingPriceLicensed';
import {
  type BillingPriceLicensedDto,
  type SubscriptionInterval,
} from '~/generated/graphql';

export const geProductPrice = (
  interval: SubscriptionInterval,
  product?: PlansQueryBillingBaseProduct,
) =>
  product?.prices?.find(
    (price): price is BillingPriceLicensedDto =>
      isBillingPriceLicensed(price) && price.recurringInterval === interval,
  );
