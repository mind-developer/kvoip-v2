/* @license Enterprise */

import {
  NotImplementedException,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCheckoutSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-checkout-session.input';
import { BillingPaySubscriptionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-pay-subscription.input';
import { BillingSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-session.input';
import { BillingSwitchPlanInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-switch-plan.input';
import { BillingUpdateSubscriptionItemPriceInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-update-subscription-item-price.input';
import { BillingEndTrialPeriodOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-end-trial-period.output';
import { BillingMeteredProductUsageOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-metered-product-usage.output';
import { BillingPaySubscriptionOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-pay-subscription-input';
import { BillingPlanOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-plan.output';
import { BillingPriceOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-price.output';
import { BillingSessionOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-session.output';
import { BillingSwitchPlanOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-switch-plan.output';
import { BillingUpdateOneTimePaidSubscriptionOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-update-onetime-pad-subscription.output';
import { BillingUpdateOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-update.output';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type BillingPortalCheckoutSessionParameters } from 'src/engine/core-modules/billing/types/billing-portal-checkout-session-parameters.type';
import { formatBillingDatabaseProductToBaseProductDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-base-product-dto.util';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { DevOnlyGuard } from 'src/engine/guards/dev-only.guard';
import { KvoipAdminApiKeyGuard } from 'src/engine/guards/kvoip-admin-api-key.guard';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class BillingResolver {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingPortalWorkspaceService: BillingPortalWorkspaceService,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Query(() => BillingSessionOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async billingPortalSession(
    @AuthWorkspace() workspace: Workspace,
    @Args() { returnUrlPath }: BillingSessionInput,
  ) {
    return {
      url: await this.billingPortalWorkspaceService.computeBillingPortalSessionURLOrThrow(
        workspace,
        returnUrlPath,
      ),
    };
  }

  @Mutation(() => BillingSessionOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async checkoutSession(
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Context() context: I18nContext,
    @Args()
    {
      recurringInterval,
      successUrlPath,
      plan,
      requirePaymentMethod,
      paymentProvider,
      interChargeData,
    }: BillingCheckoutSessionInput,
    @AuthApiKey() apiKey?: string,
  ) {
    await this.validateCanCheckoutSessionPermissionOrThrow({
      workspaceId: workspace.id,
      userWorkspaceId,
      apiKeyId: apiKey,
      workspaceActivationStatus: workspace.activationStatus,
    });

    const checkoutSessionParams: BillingPortalCheckoutSessionParameters = {
      user,
      workspace,
      successUrlPath,
      plan: plan ?? BillingPlanKey.PRO,
      requirePaymentMethod,
    };

    const billingPricesPerPlan = await this.billingPlanService.getPricesPerPlan(
      {
        planKey: checkoutSessionParams.plan,
        interval: recurringInterval,
      },
    );

    // For 7-day trials (no payment method required), create subscription directly
    // For 30-day trials (payment method required), use checkout session flow
    if (!requirePaymentMethod) {
      const successUrl =
        await this.billingPortalWorkspaceService.createDirectSubscription({
          ...checkoutSessionParams,
          billingPricesPerPlan,
          paymentProvider,
          interChargeData,
          locale: context.req.locale || SOURCE_LOCALE,
        });

      return {
        url: successUrl,
      };
    } else {
      const checkoutSessionURL =
        await this.billingPortalWorkspaceService.computeCheckoutSessionURL({
          ...checkoutSessionParams,
          billingPricesPerPlan,
          paymentProvider,
          interChargeData,
          locale: context.req.locale || SOURCE_LOCALE,
        });

      return {
        url: checkoutSessionURL,
      };
    }
  }

  @Mutation(() => BillingUpdateOneTimePaidSubscriptionOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async updateOneTimePaidSubscription(
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Context() context: I18nContext,
    @AuthApiKey() apiKey?: string,
  ): Promise<BillingUpdateOneTimePaidSubscriptionOutput> {
    await this.validateCanCheckoutSessionPermissionOrThrow({
      workspaceId: workspace.id,
      userWorkspaceId,
      apiKeyId: apiKey,
      workspaceActivationStatus: workspace.activationStatus,
    });

    const currentSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        {
          workspaceId: workspace.id,
        },
      );

    if (!currentSubscription)
      throw new BillingException(
        `Billing charge not found`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );

    const bankSlipFileLink =
      await this.billingSubscriptionService.updateOneTimePaymentSubscription({
        subscription: currentSubscription,
        user,
        locale: context.req.locale,
      });

    return {
      bankSlipFileLink,
    };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async switchToYearlyInterval(@AuthWorkspace() workspace: Workspace) {
    await this.billingSubscriptionService.switchToYearlyInterval(workspace);

    return { success: true };
  }

  @Mutation(() => BillingSwitchPlanOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async switchPlan(
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() { plan }: BillingSwitchPlanInput,
    @AuthApiKey() apiKey?: string,
  ): Promise<BillingSwitchPlanOutput> {
    await this.validateCanCheckoutSessionPermissionOrThrow({
      workspaceId: workspace.id,
      userWorkspaceId,
      apiKeyId: apiKey,
      workspaceActivationStatus: workspace.activationStatus,
    });

    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        {
          workspaceId: workspace.id,
        },
      );

    const { baseProduct, planKey, subscription } =
      await this.billingSubscriptionService.switchSubscriptionPlan(
        billingSubscription,
        plan,
      );

    return {
      planKey,
      subscription,
      baseProduct: formatBillingDatabaseProductToBaseProductDTO(baseProduct),
    };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async switchToEnterprisePlan(@AuthWorkspace() workspace: Workspace) {
    await this.billingSubscriptionService.switchToEnterprisePlan(workspace);

    return { success: true };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async updateSubscriptionItemPrice(
    @AuthWorkspace() workspace: Workspace,
    @Args() { priceId }: BillingUpdateSubscriptionItemPriceInput,
  ) {
    await this.billingService.updateMeteredSubscriptionPrice(
      workspace.id,
      priceId,
    );

    return { success: true };
  }

  @Query(() => [BillingPlanOutput])
  @UseGuards(WorkspaceAuthGuard)
  async plans(): Promise<BillingPlanOutput[]> {
    const plans = await this.billingPlanService.getPlans();

    return plans.map(formatBillingDatabaseProductToGraphqlDTO);
  }

  @Mutation(() => BillingEndTrialPeriodOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async endSubscriptionTrialPeriod(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<BillingEndTrialPeriodOutput> {
    return await this.billingSubscriptionService.endTrialPeriod(workspace);
  }

  @Query(() => [BillingMeteredProductUsageOutput])
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async getMeteredProductsUsage(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<BillingMeteredProductUsageOutput[]> {
    const result =
      await this.billingUsageService.getMeteredProductsUsage(workspace);

    return result;
  }

  @Query(() => [BillingPriceOutput])
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async listAvailableMeteredBillingPrices(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<BillingPriceOutput[]> {
    return (
      await this.billingService.listMeteredBillingPricesByWorkspaceIdAndProductKey(
        workspace.id,
      )
    ).reduce(
      (acc, billingPrice) =>
        isDefined(billingPrice.tiers?.[0].flat_amount) &&
        isDefined(billingPrice.nickname) &&
        isDefined(billingPrice.interval)
          ? acc.concat({
              amount: billingPrice.tiers[0].flat_amount,
              nickname: billingPrice.nickname,
              stripePriceId: billingPrice.stripePriceId,
              recurringInterval: billingPrice.interval,
            })
          : acc,
      [] as BillingPriceOutput[],
    );
  }

  @Mutation(() => BillingPaySubscriptionOutput)
  @UseGuards(DevOnlyGuard, KvoipAdminApiKeyGuard)
  async devOnlyPaySubscription(
    @Args() { interChargeCode }: BillingPaySubscriptionInput,
    @AuthApiKey() apiKey?: string,
  ): Promise<BillingPaySubscriptionOutput> {
    throw new NotImplementedException();
  }

  private async validateCanCheckoutSessionPermissionOrThrow({
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    workspaceActivationStatus,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    apiKeyId?: string;
    workspaceActivationStatus: WorkspaceActivationStatus;
  }) {
    if (
      (await this.billingService.isSubscriptionIncompleteOnboardingStatus(
        workspaceId,
      )) ||
      workspaceActivationStatus ===
        WorkspaceActivationStatus.PENDING_CREATION ||
      workspaceActivationStatus === WorkspaceActivationStatus.ONGOING_CREATION
    ) {
      return;
    }

    const userHasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: PermissionFlagType.WORKSPACE,
        apiKeyId,
      });

    if (!userHasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return;
  }
}
