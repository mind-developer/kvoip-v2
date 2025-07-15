import { registerEnumType } from '@nestjs/graphql';

export enum BillingProductLimitType {
  MAX_UNITS = 'MAX_UNITS',
}

registerEnumType(BillingProductLimitType, {
  name: 'BillingProductLimitType',
  description:
    'Type of limits for products for products with fixed limits, e.g: WORSPACE_MEMBERS_LIMIT: MAX_UNITS',
});
