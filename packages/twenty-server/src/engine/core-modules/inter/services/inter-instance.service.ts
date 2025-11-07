/* @kvoip-woulz proprietary */
import { Inject, Injectable, Logger } from '@nestjs/common';

import fs from 'fs';
import https from 'https';

import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import qs from 'qs';

import {
  GetAuthTokenInput,
  GetAuthTokenResponse,
} from 'src/engine/core-modules/inter/interfaces/auth.interface';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class InterInstanceService {
  private readonly logger = new Logger(InterInstanceService.name);
  private serverInterApiInstance: AxiosInstance;
  private workspaceInterApiInstances: Map<string, AxiosInstance> = new Map();
  private readonly CACHE_KEY_TOKEN = 'inter:oauth:token';
  private readonly CACHE_KEY_TOKEN_EXPIRES = 'inter:oauth:token:expires';

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    @Inject(CacheStorageNamespace.ModuleInter)
    private readonly cacheStorageService: CacheStorageService,
  ) {
    if (!twentyConfigService.get('IS_BILLING_ENABLED')) return;

    const interBaseUrl = twentyConfigService.get('INTER_BASE_URL');

    if (!interBaseUrl) throw new Error('INTER_BASE_URL is not configured');

    const certPath = `${process.cwd()}/${twentyConfigService.get('INTER_SECRET_CERT_PATH')}`;
    const keyPath = `${process.cwd()}/${twentyConfigService.get('INTER_SECRET_KEY_PATH')}`;

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath))
      throw new Error('Inter secret files not found');

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    });

    this.serverInterApiInstance = axios.create({
      baseURL: this.twentyConfigService.get('INTER_BASE_URL'),
      httpsAgent,
    });

    // Configura o interceptor para injetar o token automaticamente
    this.setupAuthInterceptor();
  }

  getInterAxiosInstance(integration?: InterIntegration): AxiosInstance {
    if (integration) {
      return this.getWorkspaceAxiosInstance(integration);
    }

    return this.serverInterApiInstance;
  }

  /**
   * Gets or creates an axios instance for a specific workspace integration
   */
  private getWorkspaceAxiosInstance(
    integration: InterIntegration,
  ): AxiosInstance {
    const cacheKey = integration.id;

    if (this.workspaceInterApiInstances.has(cacheKey)) {
      return this.workspaceInterApiInstances.get(cacheKey)!;
    }

    const interApiInstance =
      this.createInterApiInstanceFromIntegration(integration);

    this.workspaceInterApiInstances.set(cacheKey, interApiInstance);

    return interApiInstance;
  }

  /**
   * Creates an axios instance from a workspace integration entity
   */
  private createInterApiInstanceFromIntegration(
    integration: InterIntegration,
  ): AxiosInstance {
    if (!integration.privateKey || !integration.certificate) {
      throw new Error(
        `Integration ${integration.id} is missing certificate or private key`,
      );
    }

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: Buffer.from(integration.certificate, 'utf-8'),
      key: Buffer.from(integration.privateKey, 'utf-8'),
    });

    const interApiInstance = axios.create({
      baseURL: this.twentyConfigService.get('INTER_BASE_URL'),
      httpsAgent,
    });

    this.setupAuthInterceptor(interApiInstance, integration);

    this.logger.log(
      `Created axios instance for workspace integration: ${integration.id}`,
    );

    return interApiInstance;
  }

  /**
   * Configura o interceptor que injeta o Bearer token automaticamente em todas as requisições
   * (exceto na rota de autenticação)
   *
   * @param integration Integração específica do workspace
   */
  private setupAuthInterceptor(
    workspaceApiInstance?: AxiosInstance,
    integration?: InterIntegration,
  ): void {
    // Assuming workspace integration first, if not provided, use the server integration.
    if (
      (workspaceApiInstance && !integration) ||
      (!workspaceApiInstance && integration)
    ) {
      throw new Error(
        'Both workspaceApiInstance and integration must be provided together',
      );
    }

    const apiInstance = workspaceApiInstance || this.serverInterApiInstance;

    apiInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (config.url?.includes('/oauth/v2/token')) {
          return config;
        }

        /* @kvoip-woulz proprietary:begin */
        const token = await this.getOauthToken(integration);
        /* @kvoip-woulz proprietary:end */

        if (!config.headers) {
          config.headers = {} as InternalAxiosRequestConfig['headers'];
        }

        config.headers.Authorization = `Bearer ${token}`;
        config.headers['Content-Type'] = 'application/json';

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  /* @kvoip-woulz proprietary:begin */
  /**
   * Obtém o token OAuth, reutilizando o cache se ainda válido
   * ou renovando se expirado
   *
   * @param integration Optional workspace integration. If provided, uses workspace-level credentials,
   *                    otherwise uses server-level credentials
   */
  async getOauthToken(integration?: InterIntegration): Promise<string> {
    // Determine cache keys based on integration type
    const tokenKey = integration
      ? `inter:oauth:token:${integration.id}`
      : this.CACHE_KEY_TOKEN;
    const expiresKey = integration
      ? `inter:oauth:token:expires:${integration.id}`
      : this.CACHE_KEY_TOKEN_EXPIRES;

    // Check if cached token is still valid
    const cachedToken = await this.cacheStorageService.get<string>(tokenKey);
    const tokenExpiresAt =
      await this.cacheStorageService.get<string>(expiresKey);

    if (
      cachedToken &&
      tokenExpiresAt &&
      new Date() < new Date(tokenExpiresAt)
    ) {
      const logMessage = integration
        ? `Using cached OAuth token for integration: ${integration.id}`
        : 'Using cached OAuth token';

      this.logger.debug(logMessage);

      return cachedToken;
    }

    // Determine which axios instance and credentials to use
    const axiosInstance = integration
      ? this.getWorkspaceAxiosInstance(integration)
      : this.serverInterApiInstance;

    const clientId = integration
      ? integration.clientId
      : this.twentyConfigService.get('INTER_CLIENT_ID');

    const clientSecret = integration
      ? integration.clientSecret
      : this.twentyConfigService.get('INTER_CLIENT_SECRET');

    const logMessage = integration
      ? `Fetching new OAuth token for workspace integration: ${integration.id}`
      : 'Fetching new OAuth token from Inter API';

    this.logger.log(logMessage);

    // Request new token
    const response = await axiosInstance.post<
      GetAuthTokenResponse,
      AxiosResponse<GetAuthTokenResponse, GetAuthTokenInput>
    >(
      '/oauth/v2/token',
      qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope:
          'cob.write cob.read cobv.write cobv.read lotecobv.write lotecobv.read pix.write pix.read webhook.write webhook.read payloadlocation.write payloadlocation.read boleto-cobranca.read boleto-cobranca.write extrato.read pagamento-pix.write pagamento-pix.read extrato-usend.read pagamento-boleto.read pagamento-boleto.write pagamento-darf.write pagamento-lote.write pagamento-lote.read webhook-banking.read webhook-banking.write pagamento-pix.read',
      }),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    );

    // Cache token with expiration
    // Renew 5 minutes before actual expiration to avoid race conditions
    const expiresInSeconds = response.data.expires_in;
    const safetyMarginSeconds = 300; // 5 minutes
    const effectiveExpirationSeconds = Math.max(
      expiresInSeconds - safetyMarginSeconds,
      0,
    );

    const newToken = response.data.access_token;
    const expiresAt = new Date(Date.now() + effectiveExpirationSeconds * 1000);
    const ttlMilliseconds = effectiveExpirationSeconds * 1000;

    await this.cacheStorageService.set(tokenKey, newToken, ttlMilliseconds);
    await this.cacheStorageService.set(
      expiresKey,
      expiresAt.toISOString(),
      ttlMilliseconds,
    );

    const cacheLogMessage = integration
      ? `OAuth token cached for integration ${integration.id}. Expires at: ${expiresAt.toISOString()}`
      : `OAuth token cached in Redis. Expires at: ${expiresAt.toISOString()}`;

    this.logger.log(cacheLogMessage);

    return newToken;
  }

  /**
   * Invalida o token em cache, forçando renovação na próxima requisição
   */
  async invalidateToken(): Promise<void> {
    this.logger.log('Invalidating cached OAuth token');
    await this.cacheStorageService.del(this.CACHE_KEY_TOKEN);
    await this.cacheStorageService.del(this.CACHE_KEY_TOKEN_EXPIRES);
  }
}
