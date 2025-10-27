/* eslint-disable @nx/workspace-rest-api-methods-should-be-guarded */
import { Controller, Get, Param, Req, Res, UseFilters } from '@nestjs/common';

import { Request, Response } from 'express';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { TraceableService } from 'src/engine/core-modules/dadshboard-linklogs/services/traceable.service';

@Controller('traceable')
@UseFilters(RestApiExceptionFilter)
export class TraceableController {
  constructor(private readonly traceableService: TraceableService) {}

  @Get('/r/:workspaceId/:traceableId')
  async handleLinkAccess(
    @Req() req: Request,
    @Res() res: Response,
    @Param('workspaceId') workspaceId: string,
    @Param('traceableId') traceableId: string,
  ) {
    const rawPlatform = req.headers['sec-ch-ua-platform'];
    const platform =
      typeof rawPlatform === 'string'
        ? rawPlatform
        : Array.isArray(rawPlatform)
          ? rawPlatform[0]
          : '';

    const requestIp = this.extractClientIp(req);

    const { traceable, notFoundUrl } =
      await this.traceableService.handleLinkAccess({
        workspaceId,
        traceableId,
        userAgent: req.headers['user-agent'] || '',
        userIp: requestIp,
        platform,
      });

    const finalUrl = traceable?.generatedUrl?.primaryLinkUrl;

    return res.redirect(302, finalUrl ?? (notFoundUrl as string));
  }

  private extractClientIp(req: Request): string {
    // Check X-Forwarded-For header (set by proxies/load balancers)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      // Take the first IP in the chain (the original client)
      const clientIp = ips.split(',')[0].trim();
      if (clientIp) return clientIp;
    }

    // Check X-Real-IP header (set by nginx and similar proxies)
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to req.ip (may be ::1 or 127.0.0.1 on localhost)
    return req.ip || '';
  }
}
