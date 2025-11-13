import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FinancialClosingService } from 'src/engine/core-modules/financial-closing/financial-closing.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { CreateFinancialClosingInput } from './dtos/create-financial-closing.input';
import { UpdateFinancialClosingInput } from './dtos/update-financial-closing.input';
import { FinancialClosing } from './financial-closing.entity';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => FinancialClosing)
export class FinancialClosingResolver {
  constructor(
    private readonly financialClosingService: FinancialClosingService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Mutation(() => FinancialClosing)
  async createFinancialClosing(
    @Args('createInput') createInput: CreateFinancialClosingInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<FinancialClosing> {
    await this.confirmFinancialClosingPermissionOrThrow(
      userWorkspaceId,
      workspace.id,
    );
    return await this.financialClosingService.create(createInput);
  }

  @Query(() => [FinancialClosing])
  async financialClosingsByWorkspace(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<FinancialClosing[]> {
    await this.confirmFinancialClosingPermissionOrThrow(
      userWorkspaceId,
      workspace.id,
    );
    return await this.financialClosingService.findAll(workspace.id);
  }

  @Query(() => FinancialClosing)
  async financialClosingById(
    @Args('id') id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<FinancialClosing | null> {
    await this.confirmFinancialClosingPermissionOrThrow(
      userWorkspaceId,
      workspace.id,
    );
    return await this.financialClosingService.findById(id);
  }

  @Mutation(() => FinancialClosing)
  async updateFinancialClosing(
    @Args('updateInput') updateInput: UpdateFinancialClosingInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<FinancialClosing> {
    await this.confirmFinancialClosingPermissionOrThrow(
      userWorkspaceId,
      workspace.id,
    );
    return await this.financialClosingService.update(updateInput);
  }

  @Mutation(() => Boolean)
  async deleteFinancialClosing(
    @Args('financialClosingId') financialClosingId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    await this.confirmFinancialClosingPermissionOrThrow(
      userWorkspaceId,
      workspace.id,
    );
    return await this.financialClosingService.delete(financialClosingId);
  }

  async confirmFinancialClosingPermissionOrThrow(
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<boolean> {
    if (
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        setting: PermissionFlagType.FINANCIAL_CLOSING,
        workspaceId,
      }))
    ) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }
    return true;
  }
}
