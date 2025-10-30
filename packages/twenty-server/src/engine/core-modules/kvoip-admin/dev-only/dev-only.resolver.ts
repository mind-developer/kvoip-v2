import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { BillingPaySubscriptionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-pay-subscription.input';
import { BillingPaySubscriptionOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-pay-subscription-input';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { DevOnlyService } from 'src/engine/core-modules/kvoip-admin/dev-only/dev-only.service';
import { DevOnlyMutationsDTO } from 'src/engine/core-modules/kvoip-admin/dev-only/dtos/dev-only-mutations.dto';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { DevOnlyGuard } from 'src/engine/guards/dev-only.guard';
import { KvoipAdminApiKeyGuard } from 'src/engine/guards/kvoip-admin-api-key.guard';

@Resolver(() => DevOnlyMutationsDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class DevOnlyResolver {
  constructor(private readonly devOnlyService: DevOnlyService) {}

  @ResolveField(() => BillingPaySubscriptionOutput)
  @UseGuards(DevOnlyGuard, KvoipAdminApiKeyGuard)
  async paySubscription(
    @Parent() _parent: DevOnlyMutationsDTO,
    @Args() { interChargeCode }: BillingPaySubscriptionInput,
    @AuthApiKey() _apiKey?: string,
  ): Promise<BillingPaySubscriptionOutput> {
    const result = await this.devOnlyService.billingPayBill({
      interChargeCode,
    });

    return {
      success: result.success,
    };
  }
}
