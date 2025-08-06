import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import { isDefined } from 'class-validator';
import { Repository } from 'typeorm';

import { HandleLinkAccessResult } from 'src/engine/core-modules/dadshboard-linklogs/interfaces/traceable.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { LinkLogsWorkspaceEntity } from 'src/modules/linklogs/standard-objects/linklog.workspace-entity';
import { TraceableWorkspaceEntity } from 'src/modules/traceable/standard-objects/traceable.workspace-entity';

@Injectable()
export class TraceableService {
  private readonly logger = new Logger('TraceableController');

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async handleLinkAccess(input: {
    workspaceId: string;
    traceableId: string;
    userAgent: string;
    userIp: string;
    platform: string;
  }): Promise<HandleLinkAccessResult> {
    const { workspaceId, traceableId, userAgent, userIp, platform } = input;

    const notFoundUrl = `${this.twentyConfigService.get('DEFAULT_SUBDOMAIN')}.${this.twentyConfigService.get('FRONTEND_URL') ?? this.twentyConfigService.get('SERVER_URL')}/not-found`;

    const traceableRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TraceableWorkspaceEntity>(
        workspaceId,
        'traceable',
        { shouldBypassPermissionChecks: true },
      );

    if (!workspaceId) {
      this.logger.error(
        `Missing workspaceId in payload ${JSON.stringify(input)}`,
      );

      return { workspace: null, traceable: null, notFoundUrl };
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspace)) {
      this.logger.error(`Workspace not fond ${JSON.stringify(input)}`);

      return {
        traceable: null,
        workspace: null,
        notFoundUrl,
      };
    }

    const traceable = await traceableRepository.findOneBy({
      id: traceableId,
    });

    if (!isDefined(traceable)) {
      this.logger.error(`Traceable not fond ${JSON.stringify(input)}`);

      return {
        workspace,
        traceable: null,
        notFoundUrl: `${workspace?.subdomain ?? notFoundUrl.split('.')[0]}.${notFoundUrl.split('.')[1]}`,
      };
    }

    const normalizedPlatform = this.normalizePlatform(platform);

    const { country, regionName, city } =
      await this.getGeoLocationFromIp(userIp);

    const linklogsRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<LinkLogsWorkspaceEntity>(
        workspaceId,
        'linkLogs',
        { shouldBypassPermissionChecks: true },
      );

    const traceableAccessLog = linklogsRepository.create({
      userAgent,
      userIp,
      linkId: traceable?.id,
      utmSource: traceable?.campaignSource,
      utmMedium: traceable?.meansOfCommunication,
      utmCampaign: traceable?.campaignName,
      linkName: traceable?.name,
      platform: normalizedPlatform,
      country,
      regionName,
      city,
    });

    await linklogsRepository.save(traceableAccessLog);

    return {
      workspace,
      traceable,
      notFoundUrl,
    };
  }

  private async getGeoLocationFromIp(ip: string): Promise<{
    country: string | null;
    regionName: string | null;
    city: string | null;
  }> {
    try {
      const response = await axios.get(
        `${this.twentyConfigService.get('GEOLOCATION_API_URL')}/${ip}`,
      );

      const data = response.data;

      if (data?.status === 'success') {
        return {
          country: data.country ?? null,
          regionName: data.regionName ?? null,
          city: data.city ?? null,
        };
      } else {
        this.logger.warn(`IP lookup failed for ${ip}: ${data?.message}`);
      }
    } catch (error) {
      this.logger.error(
        `Error fetching IP info for ${ip}: ${error?.message || error}`,
      );
    }

    return {
      country: null,
      regionName: null,
      city: null,
    };
  }

  private normalizePlatform(rawPlatform?: string): string {
    if (!rawPlatform) return 'Unknown';

    const platform = rawPlatform.replace(/"/g, '').trim();

    const mobilePlatforms = ['Android', 'iOS'];
    const desktopPlatforms = [
      'Chrome OS',
      'Chromium OS',
      'Linux',
      'macOS',
      'Windows',
    ];

    if (mobilePlatforms.includes(platform)) {
      return `Mobile/${platform}`;
    }

    if (desktopPlatforms.includes(platform)) {
      return `Desktop/${platform}`;
    }

    return 'Unknown';
  }
}
