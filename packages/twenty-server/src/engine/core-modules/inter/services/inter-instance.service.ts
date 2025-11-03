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

        const token = integration
          ? await this.getWorkspaceOauthToken(integration)
          : await this.getOauthToken();

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

  /**
   * Obtém o token OAuth, reutilizando o cache se ainda válido
   * ou renovando se expirado
   */
  async getOauthToken(integration?: InterIntegration): Promise<string> {
    if (integration) {
      return this.getWorkspaceOauthToken(integration);
    }

    // Verifica se o token em cache ainda é válido
    const cachedToken = await this.cacheStorageService.get<string>(
      this.CACHE_KEY_TOKEN,
    );
    const tokenExpiresAt = await this.cacheStorageService.get<string>(
      this.CACHE_KEY_TOKEN_EXPIRES,
    );

    if (
      cachedToken &&
      tokenExpiresAt &&
      new Date() < new Date(tokenExpiresAt)
    ) {
      this.logger.debug('Using cached OAuth token');

      return cachedToken;
    }

    this.logger.log('Fetching new OAuth token from Inter API');

    const response = await this.serverInterApiInstance.post<
      GetAuthTokenResponse,
      AxiosResponse<GetAuthTokenResponse, GetAuthTokenInput>
    >(
      '/oauth/v2/token',
      qs.stringify({
        client_id: this.twentyConfigService.get('INTER_CLIENT_ID'),
        client_secret: this.twentyConfigService.get('INTER_CLIENT_SECRET'),
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

    // Cachear token com tempo de expiração
    // Renovar 5 minutos antes do tempo real de expiração para evitar race conditions
    const expiresInSeconds = response.data.expires_in;
    const safetyMarginSeconds = 300; // 5 minutos
    const effectiveExpirationSeconds = Math.max(
      expiresInSeconds - safetyMarginSeconds,
      0,
    );

    const newToken = response.data.access_token;
    const expiresAt = new Date(Date.now() + effectiveExpirationSeconds * 1000);

    const ttlMilliseconds = effectiveExpirationSeconds * 1000;

    await this.cacheStorageService.set(
      this.CACHE_KEY_TOKEN,
      newToken,
      ttlMilliseconds,
    );
    await this.cacheStorageService.set(
      this.CACHE_KEY_TOKEN_EXPIRES,
      expiresAt.toISOString(),
      ttlMilliseconds,
    );

    this.logger.log(
      `OAuth token cached in Redis. Expires at: ${expiresAt.toISOString()}`,
    );

    return newToken;
  }

  /**
   * Obtem o token OAuth para uma integração específica do workspace
   */
  private async getWorkspaceOauthToken(
    integration: InterIntegration,
  ): Promise<string> {
    const tokenKey = `inter:oauth:token:${integration.id}`;
    const expiresKey = `inter:oauth:token:expires:${integration.id}`;

    // Check if cached token is still valid
    const cachedToken = await this.cacheStorageService.get<string>(tokenKey);
    const tokenExpiresAt =
      await this.cacheStorageService.get<string>(expiresKey);

    if (
      cachedToken &&
      tokenExpiresAt &&
      new Date() < new Date(tokenExpiresAt)
    ) {
      this.logger.debug(
        `Using cached OAuth token for integration: ${integration.id}`,
      );

      return cachedToken;
    }

    this.logger.log(
      `Fetching new OAuth token for workspace integration: ${integration.id}`,
    );

    const axiosInstance = this.getWorkspaceAxiosInstance(integration);

    const response = await axiosInstance.post<
      GetAuthTokenResponse,
      AxiosResponse<GetAuthTokenResponse, GetAuthTokenInput>
    >(
      '/oauth/v2/token',
      qs.stringify({
        client_id: integration.clientId,
        client_secret: integration.clientSecret,
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

    this.logger.log(
      `OAuth token cached for integration ${integration.id}. Expires at: ${expiresAt.toISOString()}`,
    );

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
