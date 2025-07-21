/* @license Enterprise */

import Stripe from 'stripe';

import { BILLING_DEFAULT_PLAN_TO_PRODUCT_LIMIT_MAP } from 'src/engine/core-modules/billing/constants/billing-plan-to-product-limit-map.constant';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export const transformStripeProductToDatabaseProduct = (
  data: Stripe.Product,
) => {
  return {
    stripeProductId: data.id,
    name: data.name,
    active: data.active,
    description: data.description ?? '',
    images: data.images,
    marketingFeatures: data.marketing_features,
    defaultStripePriceId: data.default_price
      ? String(data.default_price)
      : undefined,
    unitLabel: data.unit_label === null ? undefined : data.unit_label,
    url: data.url === null ? undefined : data.url,
    taxCode: data.tax_code ? String(data.tax_code) : undefined,
    metadata: data.metadata,
    // limits: transformStripeProductMetadataToDatabaseBaseProductMetadata(
    //   data.metadata,
    //   data.id,
    // ),
  };
};

export const getProductLimitsFromDatabaseProduct = ({
  planKey,
  productId,
}: {
  planKey: BillingPlanKey;
  productId: string;
}) =>
  BILLING_DEFAULT_PLAN_TO_PRODUCT_LIMIT_MAP[planKey].map((limit) => ({
    productId,
    ...limit,
  }));
