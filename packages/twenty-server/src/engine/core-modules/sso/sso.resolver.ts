/* @license Enterprise */

import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { SSOProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/sso-provider-enabled.guard';
import { DeleteSsoInput } from 'src/engine/core-modules/sso/dtos/delete-sso.input';
import { DeleteSsoOutput } from 'src/engine/core-modules/sso/dtos/delete-sso.output';
import { EditSsoInput } from 'src/engine/core-modules/sso/dtos/edit-sso.input';
import { EditSsoOutput } from 'src/engine/core-modules/sso/dtos/edit-sso.output';
import { FindAvailableSSOIDPOutput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.output';
import {
  SetupOIDCSsoInput,
  SetupSAMLSsoInput,
} from 'src/engine/core-modules/sso/dtos/setup-sso.input';
import { SetupSsoOutput } from 'src/engine/core-modules/sso/dtos/setup-sso.output';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { SSOException } from 'src/engine/core-modules/sso/sso.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SettingsPermissions } from 'src/engine/metadata-modules/permissions/constants/settings-permissions.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Resolver()
@UseFilters(PermissionsGraphqlApiExceptionFilter)
@UseGuards(SettingsPermissionsGuard(SettingsPermissions.SECURITY))
export class SSOResolver {
  constructor(private readonly sSOService: SSOService) {}

  @UseGuards(WorkspaceAuthGuard, SSOProviderEnabledGuard)
  @Mutation(() => SetupSsoOutput)
  async createOIDCIdentityProvider(
    @Args('input') setupSsoInput: SetupOIDCSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<SetupSsoOutput | SSOException> {
    return this.sSOService.createOIDCIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(SSOProviderEnabledGuard)
  @Query(() => [FindAvailableSSOIDPOutput])
  async getSSOIdentityProviders(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.getSSOIdentityProviders(workspaceId);
  }

  @UseGuards(WorkspaceAuthGuard, SSOProviderEnabledGuard)
  @Mutation(() => SetupSsoOutput)
  async createSAMLIdentityProvider(
    @Args('input') setupSsoInput: SetupSAMLSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<SetupSsoOutput | SSOException> {
    return this.sSOService.createSAMLIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, SSOProviderEnabledGuard)
  @Mutation(() => DeleteSsoOutput)
  async deleteSSOIdentityProvider(
    @Args('input') { identityProviderId }: DeleteSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.deleteSSOIdentityProvider(
      identityProviderId,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, SSOProviderEnabledGuard)
  @Mutation(() => EditSsoOutput)
  async editSSOIdentityProvider(
    @Args('input') input: EditSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.editSSOIdentityProvider(input, workspaceId);
  }
}
