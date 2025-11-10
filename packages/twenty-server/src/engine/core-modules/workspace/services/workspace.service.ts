import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  FileWorkspaceFolderDeletionJob,
  type FileWorkspaceFolderDeletionJobData,
} from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { type ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { WorkspaceTelephonyService } from 'src/engine/core-modules/workspace/services/workspace-telephony.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { DEFAULT_FEATURE_FLAGS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/default-feature-flags';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  private readonly featureLookUpKey = BillingEntitlementKey.CUSTOM_DOMAIN;
  protected readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingService: BillingService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly permissionsService: PermissionsService,
    private readonly customDomainService: CustomDomainService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(FeatureFlag)
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    private readonly workspaceTelephonyService: WorkspaceTelephonyService,
    private readonly domainManagerService: DomainManagerService,
  ) {
    super(workspaceRepository);
  }

  private async isCustomDomainEnabled(workspaceId: string) {
    const isCustomDomainBillingEnabled =
      await this.billingService.hasEntitlement(
        workspaceId,
        this.featureLookUpKey,
      );

    if (!isCustomDomainBillingEnabled) {
      throw new WorkspaceException(
        `No entitlement found for this workspace`,
        WorkspaceExceptionCode.WORKSPACE_CUSTOM_DOMAIN_DISABLED,
      );
    }
  }

  private async validateSubdomainUpdate(newSubdomain: string) {
    const subdomainAvailable = await this.isSubdomainAvailable(newSubdomain);

    if (
      !subdomainAvailable ||
      this.twentyConfigService.get('DEFAULT_SUBDOMAIN') === newSubdomain
    ) {
      throw new WorkspaceException(
        'Subdomain already taken',
        WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
      );
    }
  }

  private async setCustomDomain(workspace: Workspace, customDomain: string) {
    await this.isCustomDomainEnabled(workspace.id);

    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { customDomain },
    });

    if (existingWorkspace && existingWorkspace.id !== workspace.id) {
      throw new WorkspaceException(
        'Domain already taken',
        WorkspaceExceptionCode.DOMAIN_ALREADY_TAKEN,
      );
    }

    if (
      customDomain &&
      workspace.customDomain !== customDomain &&
      isDefined(workspace.customDomain)
    ) {
      await this.customDomainService.updateCustomDomain(
        workspace.customDomain,
        customDomain,
      );
    }

    if (
      customDomain &&
      workspace.customDomain !== customDomain &&
      !isDefined(workspace.customDomain)
    ) {
      await this.customDomainService.registerCustomDomain(customDomain);
    }
  }

  //TODO os consoles serão removidos após os testes
  async setupOneSignalApp(workspaceId: string): Promise<Workspace> {
    this.logger.log(
      `🔧 Iniciando setupOneSignalApp para workspaceId: ${workspaceId}`,
    );

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!workspace) {
      this.logger.error(`❌ Workspace não encontrado para ID: ${workspaceId}`);
      throw new Error('Workspace não encontrado');
    }

    this.logger.log(
      `✅ Workspace encontrado: ${workspace.displayName} (${workspace.id})`,
    );

    if (workspace.onesignalAppId) {
      this.logger.warn(
        `⚠️ Workspace ${workspace.id} já possui integração OneSignal configurada. Ignorando criação.`,
      );

      return workspace;
    }

    const organizationApiKey =
      this.twentyConfigService.get('ONESIGNAL_API_KEY');
    const organizationId = this.twentyConfigService.get('ONESIGNAL_ORG_ID');

    if (!organizationApiKey || !organizationId) {
      this.logger.error(
        '❌ Chaves da organização OneSignal não configuradas corretamente',
      );
      throw new Error('Chaves da organização OneSignal não configuradas');
    }

    if (!workspace.subdomain) {
      this.logger.error(
        `❌ Subdomínio não definido para workspace ${workspace.id}`,
      );
      throw new Error('Subdomínio do workspace não definido');
    }

    const chromeWebOrigin = this.domainManagerService.buildWorkspaceURL({
      workspace,
    });

    try {
      this.logger.log(
        '📡 Enviando requisição para criação do app OneSignal...',
      );
      const response = await fetch('https://api.onesignal.com/apps', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${organizationApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `App_${workspace.subdomain}`,
          organization_id: organizationId,
          chrome_web_origin: chromeWebOrigin,
          chrome_web_default_notification_icon: 'DEFAULT_ICON',
          site_name: `workspace_${workspace.subdomain}`,
        }),
      });

      const responseBody = await response.json();

      this.logger.log(
        `🔍 Resposta da OneSignal API: ${JSON.stringify(responseBody)}`,
      );

      if (!response.ok || !responseBody?.id) {
        const message =
          responseBody?.errors?.[0] ||
          responseBody?.message ||
          'Erro desconhecido ao criar app OneSignal';

        this.logger.error(`❌ Erro ao criar app OneSignal: ${message}`);
        throw new Error(`Erro ao criar app OneSignal: ${message}`);
      }

      const onesignalAppId = responseBody.id;

      this.logger.log(
        `✅ App OneSignal criado com sucesso! ID: ${onesignalAppId}`,
      );

      workspace.onesignalAppId = onesignalAppId;
      await this.workspaceRepository.save(workspace);

      this.logger.log(
        `💾 Workspace atualizado com App ID. Iniciando geração da API Key...`,
      );

      const updatedWorkspace =
        await this.generateOneSignalAppToken(workspaceId);

      return updatedWorkspace;
    } catch (error) {
      this.logger.error(
        `🔥 Erro inesperado durante criação do App OneSignal para workspace ${workspace.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  //TODO os consoles serão removidos após os testes
  async generateOneSignalAppToken(workspaceId: string): Promise<Workspace> {
    this.logger.log(
      `🔐 Iniciando geração de API Key para workspaceId: ${workspaceId}`,
    );

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!workspace || !workspace.onesignalAppId) {
      throw new Error('Workspace inválido ou App ID ausente');
    }

    const organizationApiKey =
      'os_v2_org_cm3aot5lszhvxcpudzm6jwvydvmot2u7xn4uinmq2iifjzcgecfhg63j7ardzlkgzazpvkz344hazhveuu7rnrpw25rwpvxgbbcujly';

    try {
      const response = await fetch(
        `https://api.onesignal.com/apps/${workspace.onesignalAppId}/auth/tokens`,
        {
          method: 'POST',
          headers: {
            Authorization: `Key ${organizationApiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: 'API-created-token',
            ip_allowlist_mode: 'disabled',
          }),
        },
      );

      const responseBody = await response.json();

      this.logger.log(
        `🔍 Resposta da geração de token: ${JSON.stringify(responseBody)}`,
      );

      const formattedToken = responseBody?.formatted_token;

      if (!response.ok || !formattedToken) {
        const msg =
          responseBody?.errors?.[0] ||
          responseBody?.message ||
          'Erro desconhecido ao gerar token do app OneSignal';

        throw new Error(`Erro ao gerar token do app OneSignal: ${msg}`);
      }

      workspace.onesignalApiKey = formattedToken;

      const saved = await this.workspaceRepository.save(workspace);

      this.logger.log(
        `🔐 Token salvo com sucesso no workspace: ${workspace.id}`,
      );

      return saved;
    } catch (error) {
      this.logger.error(
        `🔥 Erro ao gerar token para App OneSignal do workspace ${workspace.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async updateWorkspaceById({
    payload,
    userWorkspaceId,
    apiKey,
  }: {
    payload: Partial<Workspace> & { id: string };
    userWorkspaceId?: string;
    apiKey?: string;
  }) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.id,
    });

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    await this.validateSecurityPermissions({
      payload,
      userWorkspaceId,
      workspaceId: workspace.id,
      apiKey,
    });

    await this.validateWorkspacePermissions({
      payload,
      userWorkspaceId,
      workspaceId: workspace.id,
      apiKey,
      workspaceActivationStatus: workspace.activationStatus,
    });

    if (payload.subdomain && workspace.subdomain !== payload.subdomain) {
      await this.validateSubdomainUpdate(payload.subdomain);
    }

    let customDomainRegistered = false;

    if (payload.customDomain === null && isDefined(workspace.customDomain)) {
      await this.customDomainService.deleteCustomHostnameByHostnameSilently(
        workspace.customDomain,
      );
      workspace.isCustomDomainEnabled = false;
    }

    if (
      payload.customDomain &&
      workspace.customDomain !== payload.customDomain
    ) {
      await this.setCustomDomain(workspace, payload.customDomain);
      customDomainRegistered = true;
    }

    const authProvidersBySystem = {
      google: this.twentyConfigService.get('AUTH_GOOGLE_ENABLED'),
      password: this.twentyConfigService.get('AUTH_PASSWORD_ENABLED'),
      microsoft: this.twentyConfigService.get('AUTH_MICROSOFT_ENABLED'),
    };

    if (payload.isGoogleAuthEnabled && !authProvidersBySystem.google) {
      throw new WorkspaceException(
        'Google auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }
    if (payload.isMicrosoftAuthEnabled && !authProvidersBySystem.microsoft) {
      throw new WorkspaceException(
        'Microsoft auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }
    if (payload.isPasswordAuthEnabled && !authProvidersBySystem.password) {
      throw new WorkspaceException(
        'Password auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }

    try {
      return await this.workspaceRepository.save({
        ...workspace,
        ...payload,
      });
    } catch (error) {
      // revert custom domain registration on error
      if (payload.customDomain && customDomainRegistered) {
        this.customDomainService
          .deleteCustomHostnameByHostnameSilently(payload.customDomain)
          .catch((err) => {
            this.exceptionHandlerService.captureExceptions([err]);
          });
      }
      throw error;
    }
  }

  async activateWorkspace(
    user: User,
    workspace: Workspace,
    data: ActivateWorkspaceInput,
  ) {
    if (!data.displayName || !data.displayName.length) {
      throw new BadRequestException("'displayName' not provided");
    }

    if (
      workspace.activationStatus === WorkspaceActivationStatus.ONGOING_CREATION
    ) {
      throw new Error('Workspace is already being created');
    }

    if (
      workspace.activationStatus !== WorkspaceActivationStatus.PENDING_CREATION
    ) {
      throw new Error('Workspace is not pending creation');
    }

    await this.workspaceRepository.update(workspace.id, {
      id: workspace.id,
      activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
      creatorEmail: user.email,
    });

    await this.featureFlagService.enableFeatureFlags(
      DEFAULT_FEATURE_FLAGS,
      workspace.id,
    );

    await this.workspaceManagerService.init({
      workspaceId: workspace.id,
      userId: user.id,
    });
    await this.userWorkspaceService.createWorkspaceMember(workspace.id, user);

    const appVersion = this.twentyConfigService.get('APP_VERSION');

    await this.workspaceRepository.update(workspace.id, {
      id: workspace.id,
      displayName: data.displayName,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      version: extractVersionMajorMinorPatch(appVersion),
    });

    // TODO: Implementação ruim, deve ser refatorada
    await this.setupOneSignalApp(workspace.id).catch((error) =>
      this.logger.log(
        `Failed to setup onesignal app: \n${JSON.stringify(error)}`,
      ),
    );

    const stripeFeatureFlag = this.featureFlagRepository.create({
      key: FeatureFlagKey.IS_STRIPE_INTEGRATION_ENABLED,
      workspaceId: workspace.id,
      value: true,
    });

    /* @kvoip-woulz proprietary:begin */

    if (this.twentyConfigService.get('NODE_ENV') === 'production') {
      this.logger.log('Iniciando configuração de telefonia para workspace: ', workspace.id);

      try {
        await this.workspaceTelephonyService.setupWorkspaceTelephony(
          workspace,
          user,
          data.displayName,
        );

        this.logger.log('Configuração de telefonia concluída com sucesso');
      } catch (error) {

        // TODO: implementar classe de exceção para telefonia

        this.logger.error('Erro na configuração de telefonia:', error);
        throw error;
      }
    }

    /* @kvoip-woulz proprietary:end */

    await this.featureFlagRepository.save(stripeFeatureFlag);

    return await this.workspaceRepository.findOneBy({
      id: workspace.id,
    });
  }


  async deleteMetadataSchemaCacheAndUserWorkspace(workspace: Workspace) {
    await this.userWorkspaceRepository.delete({ workspaceId: workspace.id });

    if (this.billingService.isBillingEnabled()) {
      await this.billingSubscriptionService.deleteSubscriptions(workspace.id);
    }

    await this.workspaceManagerService.delete(workspace.id);

    return workspace;
  }

  async deleteWorkspace(id: string, softDelete = false) {
    //TODO: delete all logs when #611 closed

    this.logger.log(
      `${softDelete ? 'Soft' : 'Hard'} deleting workspace ${id} ...`,
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    assert(workspace, 'Workspace not found');

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId: id,
      },
      withDeleted: true,
    });

    for (const userWorkspace of userWorkspaces) {
      await this.handleRemoveWorkspaceMember(
        id,
        userWorkspace.userId,
        softDelete,
      );
    }
    this.logger.log(`workspace ${id} user workspaces deleted`);

    await this.workspaceCacheStorageService.flush(
      workspace.id,
      workspace.metadataVersion,
    );
    this.logger.log(`workspace ${id} cache flushed`);

    if (softDelete) {
      if (this.billingService.isBillingEnabled()) {
        await this.billingSubscriptionService.deleteSubscriptions(workspace.id);
      }

      await this.workspaceRepository.softDelete({ id });

      this.logger.log(`workspace ${id} soft deleted`);

      return workspace;
    }

    await this.deleteMetadataSchemaCacheAndUserWorkspace(workspace);

    await this.messageQueueService.add<FileWorkspaceFolderDeletionJobData>(
      FileWorkspaceFolderDeletionJob.name,
      { workspaceId: id },
    );

    if (workspace.customDomain) {
      await this.customDomainService.deleteCustomHostnameByHostnameSilently(
        workspace.customDomain,
      );
      this.logger.log(`workspace ${id} custom domain deleted`);
    }

    await this.workspaceRepository.delete(id);

    this.logger.log(`workspace ${id} hard deleted`);

    return workspace;
  }

  async handleRemoveWorkspaceMember(
    workspaceId: string,
    userId: string,
    softDelete = false,
  ) {
    if (softDelete) {
      await this.userWorkspaceRepository.softDelete({
        userId,
        workspaceId,
      });
    } else {
      await this.userWorkspaceRepository.delete({
        userId,
        workspaceId,
      });
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        userId,
      },
    });

    if (userWorkspaces.length === 0) {
      await this.userRepository.softDelete(userId);
    }
  }

  async isSubdomainAvailable(subdomain: string) {
    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { subdomain: subdomain },
    });

    return !existingWorkspace;
  }

  private async validateSecurityPermissions({
    payload,
    userWorkspaceId,
    workspaceId,
    apiKey,
  }: {
    payload: Partial<Workspace>;
    userWorkspaceId?: string;
    workspaceId: string;
    apiKey?: string;
  }) {
    if (
      'isGoogleAuthEnabled' in payload ||
      'isMicrosoftAuthEnabled' in payload ||
      'isPasswordAuthEnabled' in payload ||
      'isPublicInviteLinkEnabled' in payload
    ) {
      if (!userWorkspaceId) {
        throw new Error('Missing userWorkspaceId in authContext');
      }

      const userHasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          setting: PermissionFlagType.SECURITY,
          workspaceId: workspaceId,
          apiKeyId: apiKey,
        });

      if (!userHasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage:
              'You do not have permission to manage security settings. Please contact your workspace administrator.',
          },
        );
      }
    }
  }

  private async validateWorkspacePermissions({
    payload,
    userWorkspaceId,
    workspaceId,
    apiKey,
    workspaceActivationStatus,
  }: {
    payload: Partial<Workspace>;
    userWorkspaceId?: string;
    workspaceId: string;
    apiKey?: string;
    workspaceActivationStatus: WorkspaceActivationStatus;
  }) {
    if (
      'displayName' in payload ||
      'subdomain' in payload ||
      'customDomain' in payload ||
      'logo' in payload
    ) {
      if (!userWorkspaceId) {
        throw new Error('Missing userWorkspaceId in authContext');
      }

      if (
        workspaceActivationStatus === WorkspaceActivationStatus.PENDING_CREATION
      ) {
        return;
      }

      const userHasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          workspaceId,
          setting: PermissionFlagType.WORKSPACE,
          apiKeyId: apiKey,
        });

      if (!userHasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage:
              'You do not have permission to manage workspace settings. Please contact your workspace administrator.',
          },
        );
      }
    }
  }

}
