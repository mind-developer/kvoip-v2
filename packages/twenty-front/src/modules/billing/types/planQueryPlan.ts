import { type ArrayElement } from 'type-fest/source/internal';
import { type BillingBaseProductPricesQuery } from '~/generated-metadata/graphql';

export type BillingBaseProductPricesQueryPlan = ArrayElement<
  BillingBaseProductPricesQuery['plans']
>;
