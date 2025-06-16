import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateFocusNfeIntegrationInput } from 'src/modules/focus-nfe/dtos/create-focus-nfe-integration.input';
import { UpdateFocusNfeIntegrationInput } from 'src/modules/focus-nfe/dtos/update-focus-nfe-integration.input';
import { FocusNfeService } from 'src/modules/focus-nfe/focus-nfe-integration.service';
import { FocusNFeWorkspaceEntity } from 'src/modules/focus-nfe/standard-objects/focus-nfe.workspace-entity';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => FocusNFeWorkspaceEntity)
export class FocusNfeResolver {
  constructor(private readonly focusNfeService: FocusNfeService) {}

  @Mutation(() => FocusNFeWorkspaceEntity)
  async createFocusNfeIntegration(
    @AuthWorkspace() workspace: Workspace,
    @Args('createInput') createInput: CreateFocusNfeIntegrationInput,
  ): Promise<FocusNFeWorkspaceEntity> {
    const newFocusNfeIntegration = await this.focusNfeService.create(
      createInput,
      workspace.id,
    );

    return newFocusNfeIntegration;
  }

  @Query(() => [FocusNFeWorkspaceEntity])
  async getFocusNfeIntegrationsByWorkspace(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<FocusNFeWorkspaceEntity[]> {
    return await this.focusNfeService.findAll(workspace.id);
  }

  @Query(() => FocusNFeWorkspaceEntity)
  async getFocusNfeIntegrationById(
    @AuthWorkspace() workspace: Workspace,
    @Args('focusNfeIntegrationId') focusNfeIntegrationId: string,
  ): Promise<FocusNFeWorkspaceEntity | null> {
    return await this.focusNfeService.findById(
      focusNfeIntegrationId,
      workspace.id,
    );
  }

  @Mutation(() => FocusNFeWorkspaceEntity)
  async updateFocusNfeIntegration(
    @AuthWorkspace() workspace: Workspace,
    @Args('updateInput') updateInput: UpdateFocusNfeIntegrationInput,
  ): Promise<FocusNFeWorkspaceEntity> {
    return await this.focusNfeService.update(updateInput, workspace.id);
  }

  @Mutation(() => Boolean)
  async deleteFocusNfeIntegration(
    @AuthWorkspace() workspace: Workspace,
    @Args('focusNfeIntegrationId') focusNfeIntegrationId: string,
  ): Promise<boolean> {
    return await this.focusNfeService.delete(
      focusNfeIntegrationId,
      workspace.id,
    );
  }

  @Mutation(() => String)
  async toggleFocusNfeIntegrationStatus(
    @AuthWorkspace() workspace: Workspace,
    @Args('focusNfeIntegrationId') focusNfeIntegrationId: string,
  ): Promise<string> {
    await this.focusNfeService.toggleStatus(
      focusNfeIntegrationId,
      workspace.id,
    );

    return 'Focus NFE integration status updated successfully';
  }
}
