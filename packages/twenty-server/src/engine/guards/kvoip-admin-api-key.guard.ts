import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class KvoipAdminApiKeyGuard implements CanActivate {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    if (!isDefined(request.apiKey)) {
      throw new AuthException(
        'This endpoint requires an API key',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const workspaceId = request.apiKey.workspaceId || request.workspace?.id;

    if (!isDefined(workspaceId)) {
      throw new AuthException(
        'API key workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const isKvoipAdmin = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_KVOIP_ADMIN,
      workspaceId,
    );

    if (!isKvoipAdmin) {
      throw new AuthException(
        'Forbiden.',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return true;
  }
}
