/* @license Enterprise */

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import Stripe from 'stripe';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { ChargeType } from 'src/engine/core-modules/billing/enums/billint-charge-type.enum';
import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
import { BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { BillingPortalCheckoutSessionParameters } from 'src/engine/core-modules/billing/types/billing-portal-checkout-session-parameters.type';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { InterCreateChargeDto } from 'src/engine/core-modules/inter/dtos/inter-create-charge.dto';
import { InterService } from 'src/engine/core-modules/inter/services/inter.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { assert } from 'src/utils/assert';

@Injectable()
export class BillingPortalWorkspaceService {
  protected readonly logger = new Logger(BillingPortalWorkspaceService.name);
  constructor(
    private readonly interService: InterService,
    private readonly stripeCheckoutService: StripeCheckoutService,
    private readonly stripeBillingPortalService: StripeBillingPortalService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async computeCheckoutSessionURL({
    user,
    workspace,
    billingPricesPerPlan,
    successUrlPath,
    plan,
    requirePaymentMethod,
    paymentProvider,
    locale,
    interChargeData,
    chargeType = ChargeType.ONE_TIME,
  }: BillingPortalCheckoutSessionParameters): Promise<string> {
    const frontBaseUrl = this.domainManagerService.buildWorkspaceURL({
      workspace,
    });

    if (paymentProvider === BillingPaymentProviders.Inter) {
      if (!isDefined(interChargeData))
        throw new BillingException(
          'Missing Inter Billing customer data',
          BillingExceptionCode.BILLING_MISSING_REQUEST_BODY,
        );

      const { cpfCnpj, legalEntity, name, address, city, stateUnity, cep } =
        interChargeData;

      // TODO: This looks kinda dumb since we a using the upsert but idk how to do it better for now
      const existingCustomer = await this.billingCustomerRepository.findOneBy({
        workspaceId: workspace.id,
      });

      await this.billingCustomerRepository.upsert(
        {
          workspaceId: workspace.id,
          document: cpfCnpj,
          legalEntity,
          name,
          address,
          city,
          stateUnity,
          cep,
          interBillingChargeId: workspace.id.slice(0, 15),
          stripeCustomerId: existingCustomer?.stripeCustomerId || randomUUID(),
        },
        {
          conflictPaths: ['workspaceId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );

      const customer = await this.billingCustomerRepository.findOneByOrFail({
        workspaceId: workspace.id,
      });

      //TODO: Call inter method to generate bolepix and sent through email
      if (!isDefined(billingPricesPerPlan?.baseProductPrice.unitAmountDecimal))
        throw new InternalServerErrorException('Plan price not found');

      await this.interService.createBolepixCharge({
        planPrice: billingPricesPerPlan.baseProductPrice.unitAmountDecimal,
        workspaceId: workspace.id,
        locale: locale || SOURCE_LOCALE,
        userEmail: user.email,
        ...(interChargeData as InterCreateChargeDto),
        customer,
        planKey: plan,
      });

      return `${frontBaseUrl.toString()}plan-required/payment-success`;
    }

    const cancelUrl = frontBaseUrl.toString();

    if (successUrlPath) {
      frontBaseUrl.pathname = successUrlPath;
    }
    const successUrl = frontBaseUrl.toString();

    const quantity = await this.userWorkspaceRepository.countBy({
      workspaceId: workspace.id,
    });

    const customer = await this.billingCustomerRepository.findOne({
      where: { workspaceId: workspace.id },
      relations: ['billingSubscriptions'],
    });

    const stripeSubscriptionLineItems = this.getStripeSubscriptionLineItems({
      quantity: chargeType === ChargeType.PER_SEAT ? quantity : 1,
      billingPricesPerPlan,
    });

    const checkoutSession =
      await this.stripeCheckoutService.createCheckoutSession({
        user,
        workspaceId: workspace.id,
        stripeSubscriptionLineItems,
        successUrl,
        cancelUrl,
        stripeCustomerId: customer?.stripeCustomerId,
        plan,
        requirePaymentMethod,
        withTrialPeriod: false,
      });

    assert(checkoutSession.url, 'Error: missing checkout.session.url');

    return checkoutSession.url;
  }

  async computeBillingPortalSessionURLOrThrow(
    workspace: Workspace,
    returnUrlPath?: string,
  ) {
    const lastSubscription = await this.billingSubscriptionRepository.findOne({
      where: { workspaceId: workspace.id },
      order: { createdAt: 'DESC' },
    });

    if (!lastSubscription) {
      throw new Error('Error: missing subscription');
    }

    const stripeCustomerId = lastSubscription.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new Error('Error: missing stripeCustomerId');
    }

    const frontBaseUrl = this.domainManagerService.buildWorkspaceURL({
      workspace,
    });

    if (returnUrlPath) {
      frontBaseUrl.pathname = returnUrlPath;
    }
    const returnUrl = frontBaseUrl.toString();

    const session =
      await this.stripeBillingPortalService.createBillingPortalSession(
        stripeCustomerId,
        returnUrl,
      );

    assert(session.url, 'Error: missing billingPortal.session.url');

    return session.url;
  }

  private getStripeSubscriptionLineItems({
    quantity,
    billingPricesPerPlan,
  }: {
    quantity: number;
    billingPricesPerPlan?: BillingGetPricesPerPlanResult;
  }): Stripe.Checkout.SessionCreateParams.LineItem[] {
    if (billingPricesPerPlan) {
      return [
        {
          price: billingPricesPerPlan.baseProductPrice.stripePriceId,
          quantity,
        },
        ...billingPricesPerPlan.meteredProductsPrices.map((price) => ({
          price: price.stripePriceId,
        })),
      ];
    }

    throw new BillingException(
      'Missing Billing prices per plan',
      BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
    );
  }
}
