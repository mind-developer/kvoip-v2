/* @license Enterprise */

import { type APP_LOCALES } from 'twenty-shared/translations';

import { type ChargeType } from 'src/engine/core-modules/billing/enums/billing-charge-type.enum';
import { type BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { type InterCreateChargeDto } from 'src/engine/core-modules/inter/dtos/inter-create-charge.dto';
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
  interChargeData?: InterCreateChargeDto;
  locale?: keyof typeof APP_LOCALES;
  chargeType?: ChargeType;
};
