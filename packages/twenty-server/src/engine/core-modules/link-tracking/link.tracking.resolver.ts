import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { LinkTrackingIntegration } from './link.tracking.entity';
import { LinkTrackingService } from './link.tracking.service';

import { CreateLinkTrackingIntegrationInput } from './dtos/create-link-tracking.integration.input';
import { UpdateLinkTrackingIntegrationInput } from './dtos/update-link-tracking-integration.input';

@Resolver(() => LinkTrackingIntegration)
export class LinkTrackingResolver {
  constructor(private readonly linkTrackingService: LinkTrackingService) {}

  @Mutation(() => LinkTrackingIntegration)
  async createLinkTracking(
    @Args('createInput') createInput: CreateLinkTrackingIntegrationInput,
  ): Promise<LinkTrackingIntegration> {
    return this.linkTrackingService.create(createInput);
  }

  @Query(() => [LinkTrackingIntegration])
  async linkTrackingsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<LinkTrackingIntegration[]> {
    return this.linkTrackingService.findAll(workspaceId);
  }

  @Query(() => LinkTrackingIntegration)
  async linkTrackingById(
    @Args('id') id: string,
  ): Promise<LinkTrackingIntegration | null> {
    return this.linkTrackingService.findById(id);
  }

  @Mutation(() => LinkTrackingIntegration)
  async updateLinkTracking(
    @Args('updateInput') updateInput: UpdateLinkTrackingIntegrationInput,
  ): Promise<LinkTrackingIntegration> {
    return this.linkTrackingService.update(updateInput);
  }
}
