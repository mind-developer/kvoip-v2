import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

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
    @InjectRepository(InterIntegration, 'core')
    private interIntegrationRepository: Repository<InterIntegration>,
    @InjectRepository(Workspace, 'core')
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

    await this.subscriptionWebhook(updatedIntegration, integration.workspace.id, updatedIntegration.id);

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

    return expirationDate > new Date() ? 'Expired' : 'Active';
  }


  private async subscriptionWebhook(
    integration: InterIntegration,
    workspaceId: string,
    integrationId: string,
  ) {
    try {
      // 1. Obter token OAuth
      // const accessToken = await this.getOAuthToken(integration);

      const accessToken = await this.getOAuthTokenForRead(integration);
      
      if (!accessToken) {
        this.logger.error('Failed to obtain OAuth token');
        return;
      }

      // // 2. Configurar webhook
      // await this.configureWebhook(integration, accessToken, workspaceId, integrationId);

      // 2. Verificar webhooks existentes
      const existingWebhooks = await this.getExistingWebhooks(integration, accessToken);
      this.logger.log('Existing webhooks:', existingWebhooks);

      // 3. Obter token OAuth para escrita
      const writeAccessToken = await this.getOAuthToken(integration);
      
      if (!writeAccessToken) {
        this.logger.error('Failed to obtain OAuth token for write');
        return;
      }

      // 4. Configurar webhook
      await this.configureWebhook(integration, writeAccessToken, workspaceId, integrationId);
      
    } catch (error) {
      this.logger.error('Error in subscriptionWebhook:', error);
      throw error;
    }
  }

  private async getOAuthTokenForRead(integration: InterIntegration): Promise<string | null> {
    const baseUrl = process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
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
      this.logger.error('OAuth token request for read failed:', error.response?.data || error.message);
      return null;
    }
  }

  private async getOAuthToken(integration: InterIntegration): Promise<string | null> {

    const baseUrl = process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
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
      this.logger.error('OAuth token request failed:', error.response?.data || error.message);
      return null;
    }
  }

  private async configureWebhook(
    integration: InterIntegration,
    accessToken: string,
    workspaceId: string,
    integrationId: string,
  ): Promise<void> {
    const webhookUrl = this.environmentService.get('WEBHOOK_URL');

    const baseUrl = process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
    const interWebhookUrl = `${baseUrl}/cobranca/v3/cobrancas/webhook`;

    const contaCorrente = '155218140';
    const agencia = '0001';

    const data = {
      webhookUrl: `${webhookUrl}/inter/webhook/${workspaceId}/${integrationId}`,
    };

    try {
      const config: AxiosRequestConfig = {
        method: 'PUT',
        url: interWebhookUrl,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-conta-corrente': contaCorrente || '',
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
      this.logger.error('Webhook configuration failed:', error.response?.data || error.message);
      throw error;
    }
  }

  private async getExistingWebhooks(
    integration: InterIntegration,
    accessToken: string,
  ): Promise<any> {
    const baseUrl = process.env.INTER_BASE_URL || 'https://cdpj.partners.bancointer.com.br';
    const webhookUrl = `${baseUrl}/cobranca/v3/cobrancas/webhook`;

    const contaCorrente = '155218140';

    try {
      const config: AxiosRequestConfig = {
        method: 'GET',
        url: webhookUrl,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-conta-corrente': contaCorrente,
        },
      };

      // Adicionar certificado se disponível
      if (integration.certificate && integration.privateKey) {
        config.httpsAgent = await this.createHttpsAgent(integration);
      }

      this.logger.log('Fetching existing webhooks...');
      const response = await axios(config);

      this.logger.log('Existing webhooks retrieved successfully:', response.data);
      return response.data;

    } catch (error) {
      this.logger.error('Failed to fetch existing webhooks:', error.response?.data || error.message);
      throw error;
    }
  }

  private async createHttpsAgent(integration: InterIntegration): Promise<any> {
    const https = require('https');
    
    try {
      // Criar arquivos temporários para certificado e chave privada
      const certPath = await this.createTempFile(integration.certificate!, 'cert.crt');
      const keyPath = await this.createTempFile(integration.privateKey!, 'key.key');

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

  private async createTempFile(content: string, filename: string): Promise<string> {
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
    filePaths.forEach(filePath => {
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
