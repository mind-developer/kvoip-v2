/* @license Enterprise */

import { type APP_LOCALES } from 'twenty-shared/translations';

import { ChargeType } from 'src/engine/core-modules/billing/enums/billing-charge-type.enum';
import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { BillingCreateChargeDto } from 'src/engine/core-modules/inter/dtos/billing-create-charge.dto';

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { type User } from 'src/engine/core-modules/user/user.entity';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export type BillingPortalCheckoutSessionParameters = {
  user: User;
  workspace: Workspace;
  billingPricesPerPlan?: BillingGetPricesPerPlanResult;
  successUrlPath?: string;
  plan: BillingPlanKey;
  requirePaymentMethod?: boolean;
  paymentProvider?: BillingPaymentProviders;
  interChargeData?: BillingCreateChargeDto;
  locale?: keyof typeof APP_LOCALES;
  chargeType?: ChargeType;
};
