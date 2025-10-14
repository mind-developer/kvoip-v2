import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const nodeEnv = this.twentyConfigService.get('NODE_ENV');

    if (
      ![NodeEnvironment.DEVELOPMENT, NodeEnvironment.TEST].includes(nodeEnv)
    ) {
      throw new AuthException(
        'This endpoint is only available in development mode',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return true;
  }
}
