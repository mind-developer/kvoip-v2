/* @license Enterprise */

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import { transformStripeSubscriptionEventToDatabaseCustomer } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-customer.util';
import { transformStripeSubscriptionEventToDatabaseSubscriptionItem } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription-item.util';
import { transformStripeSubscriptionEventToDatabaseSubscription } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { ChargeType } from 'src/engine/core-modules/billing/enums/billing-charge-type.enum';
import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
import { type BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { type BillingPortalCheckoutSessionParameters } from 'src/engine/core-modules/billing/types/billing-portal-checkout-session-parameters.type';
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
    private readonly billingSubscriptionService: BillingSubscriptionService,
    @InjectRepository(BillingSubscription)
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingSubscriptionItem)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    @InjectRepository(BillingCustomer)
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectRepository(UserWorkspace)
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
    const { successUrl, cancelUrl, customer, stripeSubscriptionLineItems } =
      await this.prepareSubscriptionParameters({
        workspace,
        billingPricesPerPlan,
        successUrlPath,
        paymentProvider,
        locale,
        interChargeData,
        chargeType,
        plan,
        user,
      });

    if (paymentProvider === BillingPaymentProviders.Inter) {
      return successUrl;
    }

    const checkoutSession =
      await this.stripeCheckoutService.createCheckoutSession({
        user,
        workspace,
        stripeSubscriptionLineItems,
        successUrl,
        cancelUrl,
        stripeCustomerId: customer?.stripeCustomerId,
        plan,
        requirePaymentMethod,
        withTrialPeriod:
          !isDefined(customer) || customer.billingSubscriptions.length === 0,
      });

    assert(checkoutSession.url, 'Error: missing checkout.session.url');

    return checkoutSession.url;
  }

  async createDirectSubscription({
    user,
    workspace,
    billingPricesPerPlan,
    successUrlPath,
    plan,
    requirePaymentMethod,
  }: BillingPortalCheckoutSessionParameters): Promise<string> {
    const { successUrl, customer, stripeSubscriptionLineItems } =
      await this.prepareSubscriptionParameters({
        workspace,
        billingPricesPerPlan,
        successUrlPath,
        user,
        plan,
      });

    const subscription =
      await this.stripeCheckoutService.createDirectSubscription({
        user,
        workspace,
        stripeSubscriptionLineItems,
        stripeCustomerId: customer?.stripeCustomerId,
        plan,
        requirePaymentMethod,
        withTrialPeriod:
          !isDefined(customer) || customer.billingSubscriptions.length === 0,
      });

    await this.syncSubscriptionToDatabase(workspace.id, subscription);

    return successUrl;
  }

  private async prepareSubscriptionParameters({
    workspace,
    billingPricesPerPlan,
    successUrlPath,
    paymentProvider,
    interChargeData,
    locale,
    chargeType,
    user,
    plan,
  }: {
    workspace: Workspace;
    billingPricesPerPlan?: BillingGetPricesPerPlanResult;
    successUrlPath?: string;
  } & Pick<
    BillingPortalCheckoutSessionParameters,
    | 'paymentProvider'
    | 'interChargeData'
    | 'locale'
    | 'chargeType'
    | 'user'
    | 'plan'
  >) {
    const frontBaseUrl = this.domainManagerService.buildWorkspaceURL({
      workspace,
    });

    const cancelUrl = frontBaseUrl.toString();

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

      const stripeSubscriptionLineItems = this.getStripeSubscriptionLineItems({
        quantity: 1,
        billingPricesPerPlan,
      });

      return {
        successUrl: `${frontBaseUrl.toString()}plan-required/payment-success`,
        cancelUrl,
        quantity: 1,
        stripeSubscriptionLineItems,
      };
    }

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
      quantity: 1,
      billingPricesPerPlan,
    });

    return {
      successUrl,
      cancelUrl,
      quantity,
      customer,
      stripeSubscriptionLineItems,
    };
  }

  private async syncSubscriptionToDatabase(
    workspaceId: string,
    subscription: Stripe.Subscription,
  ) {
    await this.billingCustomerRepository.upsert(
      transformStripeSubscriptionEventToDatabaseCustomer(workspaceId, {
        object: subscription,
      }),
      {
        conflictPaths: ['workspaceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await this.billingSubscriptionRepository.upsert(
      transformStripeSubscriptionEventToDatabaseSubscription(workspaceId, {
        object: subscription,
      }),
      {
        conflictPaths: ['stripeSubscriptionId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const billingSubscriptions = await this.billingSubscriptionRepository.find({
      where: { workspaceId },
    });

    const createdBillingSubscription = billingSubscriptions.find(
      (sub) => sub.stripeSubscriptionId === subscription.id,
    );

    if (!createdBillingSubscription) {
      throw new BillingException(
        'Billing subscription not found after creation',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }
    await this.billingSubscriptionItemRepository.upsert(
      transformStripeSubscriptionEventToDatabaseSubscriptionItem(
        createdBillingSubscription.id,
        {
          object: subscription,
        },
      ),
      {
        conflictPaths: ['stripeSubscriptionItemId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await this.billingSubscriptionService.setBillingThresholdsAndTrialPeriodWorkflowCredits(
      createdBillingSubscription.id,
    );

    this.logger.log(
      `Subscription synced to database: ${subscription.id} for workspace: ${workspaceId}`,
    );
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
