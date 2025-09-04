import { CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { isDefined } from 'twenty-shared/utils';

export class KvoipWorkspaceAdminAuthGuard implements CanActivate {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const workspaceId = request.workspace?.id;

    if (!isDefined(workspaceId)) return false;

    const isWorkspaceAdmin = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_KVOIP_ADMIN,
      workspaceId,
    );

    if (!isWorkspaceAdmin) {
      throw new AuthException(
        `Forbiden.`,
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return true;
  }
}
