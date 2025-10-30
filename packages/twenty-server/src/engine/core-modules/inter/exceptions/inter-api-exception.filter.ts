import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';

import { Response } from 'express';

import { InterApiException } from 'src/engine/core-modules/inter/exceptions/inter-api.exception';

@Catch(InterApiException)
export class InterApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(InterApiExceptionFilter.name);

  catch(exception: InterApiException, host: ArgumentsHost) {
    const contextType = host.getType<GqlContextType>();

    this.logger.error('Inter API Exception caught', {
      title: exception.title,
      detail: exception.detail,
      violacoes: exception.violacoes,
      interHttpStatus: exception.interHttpStatus,
    });

    if (contextType === 'graphql') {
      return this.handleGraphQLException(exception, host);
    }

    return this.handleHttpException(exception, host);
  }

  private handleHttpException(
    exception: InterApiException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: {
        title: exception.title,
        detail: exception.detail,
        violacoes: exception.violacoes,
        interHttpStatus: exception.interHttpStatus,
      },
    });
  }

  private handleGraphQLException(
    exception: InterApiException,
    host: ArgumentsHost,
  ): InterApiException {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    this.logger.debug('GraphQL operation that triggered error', {
      operation: info?.operation?.operation,
      fieldName: info?.fieldName,
    });

    return exception;
  }
}
