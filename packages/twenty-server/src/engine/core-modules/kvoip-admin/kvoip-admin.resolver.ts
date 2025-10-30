/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { DevOnlyMutationsDTO } from 'src/engine/core-modules/kvoip-admin/dev-only/dtos/dev-only-mutations.dto';
import { DevOnlyGuard } from 'src/engine/guards/dev-only.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class KvoipAdminRootResolver {
  @Mutation(() => DevOnlyMutationsDTO)
  @UseGuards(DevOnlyGuard, PublicEndpointGuard)
  devOnly(): DevOnlyMutationsDTO {
    return {};
  }
}
