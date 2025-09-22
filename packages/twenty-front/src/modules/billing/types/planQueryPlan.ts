import { ArrayElement } from 'type-fest/source/internal';
import { BillingBaseProductPricesQuery } from '~/generated-metadata/graphql';

export type BillingBaseProductPricesQueryPlan = ArrayElement<
  BillingBaseProductPricesQuery['plans']
>;
