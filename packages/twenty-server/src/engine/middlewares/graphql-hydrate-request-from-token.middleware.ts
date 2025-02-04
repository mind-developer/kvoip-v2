import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

@Injectable()
export class GraphQLHydrateRequestFromTokenMiddleware
  implements NestMiddleware
{
  constructor(private readonly middlewareService: MiddlewareService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    const excludedOperations = [
      'GetClientConfig',
      'GetCurrentUser',
      'GetWorkspaceFromInviteHash',
      'Track',
      'CheckUserExists',
      'Challenge',
      'Verify',
      'GetLoginTokenFromEmailVerificationToken',
      'ResendEmailVerificationToken',
      'SignUp',
      'RenewToken',
      'EmailPasswordResetLink',
      'ValidatePasswordResetToken',
      'UpdatePasswordViaResetToken',
      'IntrospectionQuery',
      'ExchangeAuthorizationCode',
      'GetAuthorizationUrl',
      'GetPublicWorkspaceDataBySubdomain',
    ];

    if (
      !this.isTokenPresent(req) &&
      (!body?.operationName || excludedOperations.includes(body.operationName))
    ) {
      return next();
    }

    try {
      await this.middlewareService.authenticateGraphqlRequest(req);
    } catch (error) {
      this.middlewareService.writeGraphqlResponseOnExceptionCaught(res, error);

      return;
    }

    next();
  }
}
