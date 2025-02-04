import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared';
import { Repository } from 'typeorm';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType } from 'src/engine/core-modules/domain-manager/domain-manager.type';
import { CustomDomainValidRecords } from 'src/engine/core-modules/domain-manager/dtos/custom-domain-valid-records';
import { generateRandomSubdomain } from 'src/engine/core-modules/domain-manager/utils/generate-random-subdomain';
import { getSubdomainFromEmail } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-from-email';
import { getSubdomainNameFromDisplayName } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-name-from-display-name';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@Injectable()
export class DomainManagerService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: EnvironmentService,
  ) {}

  getFrontUrl() {
    return new URL(
      this.environmentService.get('FRONTEND_URL') ??
        this.environmentService.get('SERVER_URL'),
    );
  }

  getBaseUrl(): URL {
    const baseUrl = this.getFrontUrl();

    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      this.environmentService.get('DEFAULT_SUBDOMAIN')
    ) {
      baseUrl.hostname = `${this.environmentService.get('DEFAULT_SUBDOMAIN')}.${baseUrl.hostname}`;
    }

    return baseUrl;
  }

  buildEmailVerificationURL({
    emailVerificationToken,
    email,
    workspaceSubdomain,
  }: {
    emailVerificationToken: string;
    email: string;
    workspaceSubdomain?: string;
  }) {
    return this.buildWorkspaceURL({
      subdomain: workspaceSubdomain,
      pathname: 'verify-email',
      searchParams: { emailVerificationToken, email },
    });
  }

  buildWorkspaceURL({
    workspace,
    pathname,
    searchParams,
  }: {
    subdomain?: string;
    pathname?: string;
    searchParams?: Record<string, string | number>;
  }) {
    const url = this.getBaseUrl();

    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      !subdomain
    ) {
      throw new Error('subdomain is required when multiworkspace is enable');
    }

    if (
      subdomain &&
      subdomain.length > 0 &&
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')
    ) {
      url.hostname = url.hostname.replace(
        this.environmentService.get('DEFAULT_SUBDOMAIN'),
        subdomain,
      );
    }

    if (pathname) {
      url.pathname = pathname;
    }

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (isDefined(value)) {
          url.searchParams.set(key, value.toString());
        }
      });
    }

    return url;
  }

  getWorkspaceSubdomainByOrigin = (origin: string) => {
    const { hostname: originHostname } = new URL(origin);

    const frontDomain = this.getFrontUrl().hostname;

    const isFrontdomain = originHostname.endsWith(`.${frontDomain}`);

    const subdomain = originHostname.replace(`.${frontDomain}`, '');

    if (this.isDefaultSubdomain(subdomain)) {
      return;
    }

    return subdomain;
  };

  async getWorkspaceBySubdomainOrDefaultWorkspace(subdomain?: string) {
    return subdomain
      ? await this.workspaceRepository.findOne({
          where: { subdomain },
        })
      : await this.getDefaultWorkspace();
  }

  isDefaultSubdomain(subdomain: string) {
    return subdomain === this.environmentService.get('DEFAULT_SUBDOMAIN');
  }

  computeRedirectErrorUrl(
    errorMessage: string,
    {
      subdomain,
    }: {
      subdomain?: string;
    },
  ) {
    const url = this.buildWorkspaceURL({
      subdomain: subdomain ?? this.environmentService.get('DEFAULT_SUBDOMAIN'),
      pathname: '/verify',
      searchParams: { errorMessage },
    });

    return url.toString();
  }

  private async getDefaultWorkspace() {
    if (this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
      throw new Error(
        'Default workspace does not exist when multi-workspace is enabled',
      );
    }

    const workspaces = await this.workspaceRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['workspaceSSOIdentityProviders'],
    });

    if (workspaces.length > 1) {
      Logger.warn(
        ` ${workspaces.length} workspaces found in database. In single-workspace mode, there should be only one workspace. Apple seed workspace will be used as fallback if it found.`,
      );
    }

    const foundWorkspace =
      workspaces.length === 1
        ? workspaces[0]
        : workspaces.filter(
            (workspace) => workspace.id === SEED_APPLE_WORKSPACE_ID,
          )?.[0];

    workspaceValidator.assertIsDefinedOrThrow(foundWorkspace);

    return foundWorkspace;
  }

  async getWorkspaceByOriginOrDefaultWorkspace(origin: string) {
    try {
      if (!this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
        return this.getDefaultWorkspace();
      }

      const subdomain = this.getWorkspaceSubdomainByOrigin(origin);

      if (!isDefined(subdomain)) return;

      return (
        (await this.workspaceRepository.findOne({
          where: { subdomain },
          relations: ['workspaceSSOIdentityProviders'],
        })) ?? undefined
      );
    } catch (e) {
      throw new WorkspaceException(
        'Workspace not found',
        WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND,
      );
    }

    const { subdomain, customDomain } =
      this.getSubdomainAndCustomDomainFromUrl(origin);

    if (!customDomain && !subdomain) return;

    const where = isDefined(customDomain) ? { customDomain } : { subdomain };

    return (
      (await this.workspaceRepository.findOne({
        where,
        relations: ['workspaceSSOIdentityProviders'],
      })) ?? undefined
    );
  }

  private extractSubdomain(params?: { email?: string; displayName?: string }) {
    if (params?.email) {
      return getSubdomainFromEmail(params.email);
    }

    if (params?.displayName) {
      return getSubdomainNameFromDisplayName(params.displayName);
    }
  }

  async generateSubdomain(params?: { email?: string; displayName?: string }) {
    const subdomain =
      this.extractSubdomain(params) ?? generateRandomSubdomain();

    const existingWorkspaceCount = await this.workspaceRepository.countBy({
      subdomain,
    });

    return `${subdomain}${existingWorkspaceCount > 0 ? `-${Math.random().toString(36).substring(2, 10)}` : ''}`;
  }

  private getCustomWorkspaceUrl(customDomain: string) {
    const url = this.getFrontUrl();

    url.hostname = customDomain;

    return url.toString();
  }

  private getTwentyWorkspaceUrl(subdomain: string) {
    const url = this.getFrontUrl();

    url.hostname = this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')
      ? `${subdomain}.${url.hostname}`
      : url.hostname;

    return url.toString();
  }

  getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
    workspace?: WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType | null,
  ) {
    if (!workspace) {
      return {
        subdomain: this.environmentService.get('DEFAULT_SUBDOMAIN'),
        customDomain: null,
      };
    }

    if (!workspace.isCustomDomainEnabled) {
      return {
        subdomain: workspace.subdomain,
        customDomain: null,
      };
    }

    return workspace;
  }

  isCustomDomainWorking(customDomainDetails: CustomDomainValidRecords) {
    return customDomainDetails.records.every(
      ({ status }) => status === 'success',
    );
  }

  getWorkspaceUrls({
    subdomain,
    customDomain,
    isCustomDomainEnabled,
  }: WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType) {
    return {
      customUrl:
        isCustomDomainEnabled && customDomain
          ? this.getCustomWorkspaceUrl(customDomain)
          : undefined,
      subdomainUrl: this.getTwentyWorkspaceUrl(subdomain),
    };
  }
}
