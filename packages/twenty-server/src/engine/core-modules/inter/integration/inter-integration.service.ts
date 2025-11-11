/* @kvoip-woulz proprietary */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { msg } from '@lingui/core/macro';
import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { CreateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/create-inter-integration.input';
import { UpdateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/update-inter-integration.input';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class InterIntegrationService {
  private readonly logger = new Logger(InterIntegrationService.name);

  constructor(
    @InjectRepository(InterIntegration)
    private interIntegrationRepository: Repository<InterIntegration>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: TwentyConfigService,
  ) {}

  async create(
    createInput: CreateInterIntegrationInput,
  ): Promise<InterIntegration> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const createIntegration = this.interIntegrationRepository.create({
      ...createInput,
      workspace,
      status: createInput.status ?? 'active',
    });

    const savedIntegration =
      await this.interIntegrationRepository.save(createIntegration);

    return savedIntegration;
  }

  async findAll(workspaceId: string): Promise<InterIntegration[]> {
    const integrations = await this.interIntegrationRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });

    return integrations.map((integration) => ({
      ...integration,
      status: this.getStatusFromExpirationDate(
        integration.expirationDate ?? new Date(),
      ),
    }));
  }

  async findById(id: string): Promise<InterIntegration | null> {
    return this.interIntegrationRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });
  }

  async update(
    updateInput: UpdateInterIntegrationInput,
  ): Promise<InterIntegration> {
    const integration = await this.interIntegrationRepository.findOne({
      where: { id: updateInput.id },
      relations: ['workspace'],
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const updatedIntegration = this.interIntegrationRepository.merge(
      integration,
      {
        ...updateInput,
        status: updateInput.status ?? integration.status,
      },
    );

<<<<<<< HEAD
    await this.subscriptionWebhook(
      updatedIntegration,
      integration.workspace.id,
      updatedIntegration.id,
    );
=======
    this.logger.log(`Atualizando webhook para a integração: ${updatedIntegration.id}`);
    this.logger.log(`updatedIntegration: ${JSON.stringify(updatedIntegration, null, 2)}`);
    
    await this.subscriptionWebhook(updatedIntegration, integration.workspace.id, updatedIntegration.id);
>>>>>>> a45259e4e08bc6275f8cc5a6195d0c758782d55d

    return this.interIntegrationRepository.save(updatedIntegration);
  }

  async toggleStatus(id: string): Promise<InterIntegration> {
    const integration = await this.findById(id);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    integration.status = this.getStatusFromExpirationDate(
      integration.expirationDate ?? new Date(),
    );

    return await this.interIntegrationRepository.save(integration);
  }

  private getStatusFromExpirationDate(
    expirationDate: Date | null,
  ): 'Active' | 'Expired' | 'Disabled' {
    if (!expirationDate) return 'Disabled';

    return expirationDate < new Date() ? 'Expired' : 'Active';
  }

  private handleInterApiError(error: any, operation: string): never {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      const message =
        msg`Rate limit exceeded for the Banco Inter. The operation cannot be performed at the moment. Try again in` +
        retryAfter +
        msg`seconds. The Banco Inter allows only 5 requests per minute.`.toString();

      this.logger.error(`Rate limit exceeded for ${operation}:`, {
        status: error.response.status,
        retryAfter,
        message: error.response.data,
      });

      throw new Error(message);
    }

    // Verificar se é erro de validação do Banco Inter
    if (
      error.response?.data &&
      this.isInterValidationError(error.response.data)
    ) {
      const interError = error.response.data;
      const message = this.formatInterValidationError(interError, operation);

      this.logger.error(`Inter validation error for ${operation}:`, {
        status: error.response.status,
        error: interError,
      });

      throw new Error(message);
    }

    // Erro genérico do Banco Inter
    if (error.response?.status >= 400 && error.response?.status < 500) {
      const message =
        msg`Error in the communication with the Banco Inter. Verify the data provided and try again.`.toString();

      this.logger.error(`Inter API error for ${operation}:`, {
        status: error.response.status,
        data: error.response.data,
      });

      throw new Error(message);
    }

    // Re-throw other errors
    throw error;
  }

  private isInterValidationError(errorData: any): boolean {
    return (
      errorData &&
      typeof errorData === 'object' &&
      errorData.title &&
      errorData.detail &&
      errorData.timestamp &&
      Array.isArray(errorData.violacoes)
    );
  }

  private formatInterValidationError(
    interError: any,
    operation: string,
  ): string {
    let message = msg`Inter validation error`.toString();

    if (interError.violacoes && interError.violacoes.length > 0) {
      message += ' -' + msg`Details of the errors: `.toString();
      interError.violacoes.forEach((violacao: any, index: number) => {
        message += `${violacao.propriedade}: ${violacao.razao}`;
        if (violacao.valor) {
          message += ' (' + msg`Value informed` + ': "' + violacao.valor + '")';
        }
        message += `\n    `;
      });
    }

    return message.trim();
  }

  private async subscriptionWebhook(
    integration: InterIntegration,
    workspaceId: string,
    integrationId: string,
  ) {
    try {
      const writeAccessToken = await this.getOAuthToken(integration);


      this.logger.log(`writeAccessToken: ${writeAccessToken}`);

      if (!writeAccessToken) {
        this.logger.error('Failed to obtain OAuth token for write');
        return;
      }

      await this.deleteWebhook(integration, writeAccessToken);

      await this.configureWebhook(integration, writeAccessToken, workspaceId);

      // Buscar webhooks existentes -----------------------------------------------|

      // const accessTokenForRead = await this.getOAuthTokenForRead(integration);

      // if (!accessTokenForRead) {
      //   this.logger.error('Failed to obtain OAuth token for read');
      //   return;
      // }

      // const existingWebhooks = await this.getExistingWebhooks(integration, accessTokenForRead);
      // this.logger.log('Existing webhooks:', existingWebhooks);

      // --------------------------------------------------------------------------|
    } catch (error) {
      this.logger.error('Error in subscriptionWebhook:', error);
      throw error;
    }
  }

  private async getOAuthTokenForRead(
    integration: InterIntegration,
  ): Promise<string | null> {
    const baseUrl =
      process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
    const oauthUrl = `${baseUrl}/oauth/v2/token`;

    const data = new URLSearchParams({
      client_id: integration.clientId,
      client_secret: integration.clientSecret,
      scope: 'boleto-cobranca.read',
      grant_type: 'client_credentials',
    });

    try {
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: oauthUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data.toString(),
      };

      // Adicionar certificado se disponível
      if (integration.certificate && integration.privateKey) {
        config.httpsAgent = await this.createHttpsAgent(integration);
      }

      this.logger.log('Requesting OAuth token for read...');
      const response = await axios(config);

      if (response.data && response.data.access_token) {
        this.logger.log('OAuth token for read obtained successfully');
        return response.data.access_token;
      } else {
        this.logger.error('Invalid OAuth response for read:', response.data);
        return null;
      }
    } catch (error) {
      this.logger.error(
        'OAuth token request for read failed:',
        error.response?.data || error.message,
      );
      this.handleInterApiError(error, 'Get OAuth Token for Read');
    }
  }

  private async getOAuthToken(
    integration: InterIntegration,
  ): Promise<string | null> {
    const baseUrl =
      process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
    const oauthUrl = `${baseUrl}/oauth/v2/token`;

    const data = new URLSearchParams({
      client_id: integration.clientId,
      client_secret: integration.clientSecret,
      scope: 'boleto-cobranca.write',
      grant_type: 'client_credentials',
    });

    try {
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: oauthUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data.toString(),
      };

      // Adicionar certificado se disponível
      if (integration.certificate && integration.privateKey) {
        config.httpsAgent = await this.createHttpsAgent(integration);
      }

      this.logger.log('Requesting OAuth token...');
      const response = await axios(config);

      if (response.data && response.data.access_token) {
        this.logger.log('OAuth token obtained successfully');
        this.logger.log('OAuth token:', response.data.access_token);
        return response.data.access_token;
      } else {
        this.logger.error('Invalid OAuth response:', response.data);
        return null;
      }
    } catch (error) {
      this.logger.error(
        'OAuth token request failed:',
        error.response?.data || error.message,
      );
      this.handleInterApiError(error, 'Obter Token OAuth');
    }
  }

  private async configureWebhook(
    integration: InterIntegration,
    accessToken: string,
    workspaceId: string,
    // integrationId: string,
  ): Promise<void> {
    const webhookUrl = this.environmentService.get('WEBHOOK_URL');

    const baseUrl =
      process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
    const interWebhookUrl = `${baseUrl}/cobranca/v3/cobrancas/webhook`;

    const data = {
      webhookUrl: `${webhookUrl}/inter-integration/webhook/${workspaceId}/${integration.id}`,
    };

    try {
      const config: AxiosRequestConfig = {
        method: 'PUT',
        url: interWebhookUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-conta-corrente': integration.currentAccount,
        },
        data: JSON.stringify(data),
      };

      // Adicionar certificado se disponível
      if (integration.certificate && integration.privateKey) {
        config.httpsAgent = await this.createHttpsAgent(integration);
      }

      this.logger.log('Configuring webhook:', data);
      const response = await axios(config);

      this.logger.log('Webhook configured successfully:', response.data);
    } catch (error) {
      this.logger.error(
        'Webhook configuration failed:',
        error.response?.data || error.message,
      );
      this.handleInterApiError(error, 'Configurar Webhook');
    }
  }

  private async getExistingWebhooks(
    integration: InterIntegration,
    accessToken: string,
  ): Promise<any> {
    const baseUrl =
      process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
    const webhookUrl = `${baseUrl}/cobranca/v3/cobrancas/webhook`;

    try {
      const config: AxiosRequestConfig = {
        method: 'GET',
        url: webhookUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-conta-corrente': integration.currentAccount,
        },
      };

      // Adicionar certificado se disponível
      if (integration.certificate && integration.privateKey) {
        config.httpsAgent = await this.createHttpsAgent(integration);
      }

      this.logger.log('Fetching existing webhooks...');
      const response = await axios(config);

      this.logger.log(
        'Existing webhooks retrieved successfully:',
        response.data,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch existing webhooks:',
        error.response?.data || error.message,
      );
      this.handleInterApiError(error, 'Buscar Webhooks Existentes');
    }
  }

  private async deleteWebhook(
    integration: InterIntegration,
    accessToken: string,
  ): Promise<void> {
    const baseUrl =
      process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
    const webhookUrl = `${baseUrl}/cobranca/v3/cobrancas/webhook`;

    this.logger.log(`webhookUrl: ${webhookUrl}`);
    this.logger.log(`accessToken: ${accessToken}`);
    this.logger.log(`integration: ${JSON.stringify(integration, null, 2)}`);

    try {
      const config: AxiosRequestConfig = {
        method: 'DELETE',
        url: webhookUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-conta-corrente': integration.currentAccount,
        },
      };

      // Adicionar certificado se disponível
      if (integration.certificate && integration.privateKey) {
        config.httpsAgent = await this.createHttpsAgent(integration);
      }

      this.logger.log('Deleting webhook...');
      const response = await axios(config);

      this.logger.log('Webhook deleted successfully:', response.data);
    } catch (error) {
      this.logger.error(
        'Failed to delete webhook:',
        error.response?.data || error.message,
      );
      this.handleInterApiError(error, 'Excluir Webhook');
    }
  }

  private async createHttpsAgent(integration: InterIntegration): Promise<any> {
    const https = require('https');

    try {
      // Criar arquivos temporários para certificado e chave privada
      const certPath = await this.createTempFile(
        integration.certificate!,
        'cert.crt',
      );
      const keyPath = await this.createTempFile(
        integration.privateKey!,
        'key.key',
      );

      const agent = new https.Agent({
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      });

      // Limpar arquivos temporários após um delay
      setTimeout(() => {
        this.cleanupTempFiles([certPath, keyPath]);
      }, 5000);

      return agent;
    } catch (error) {
      this.logger.error('Failed to create HTTPS agent:', error);
      throw error;
    }
  }

  private async createTempFile(
    content: string,
    filename: string,
  ): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');

    // Criar diretório temp se não existir
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, `${Date.now()}_${filename}`);
    fs.writeFileSync(tempPath, content);

    return tempPath;
  }

  private cleanupTempFiles(filePaths: string[]): void {
    filePaths.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        this.logger.warn(`Failed to cleanup temp file ${filePath}:`, error);
      }
    });
  }
}
