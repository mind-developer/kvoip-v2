import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import axios from 'axios';
import CryptoJS from 'crypto-js';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CreateFocusNfeIntegrationInput } from 'src/modules/focus-nfe/dtos/create-focus-nfe-integration.input';
import { UpdateFocusNfeIntegrationInput } from 'src/modules/focus-nfe/dtos/update-focus-nfe-integration.input';
import {
  FocusNFeWorkspaceEntity,
  Status,
  TaxRegime,
} from 'src/modules/focus-nfe/standard-objects/focus-nfe.workspace-entity';

@Injectable()
export class FocusNFeIntegrationService {

  private readonly logger = new Logger(FocusNFeIntegrationService.name);

  constructor(
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
  ) {}

  async encryptText(text: string): Promise<string> {
    const secretKey = this.environmentService.get('FOCUS_NFE_ENCRYPTION_KEY');

    if (!secretKey) return text;
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse(secretKey.slice(0, 16));

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  }

  async decryptText(cipherText: string): Promise<string> {
    const secretKey = this.environmentService.get('FOCUS_NFE_ENCRYPTION_KEY');

    if (!secretKey) return cipherText;
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted;
  }

  async create(
    createInput: CreateFocusNfeIntegrationInput,
    workspaceId: string,
  ): Promise<FocusNFeWorkspaceEntity> {
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    if (!focusNFeRepository) {
      throw new Error('FocusNFe repository not found');
    }

    const taxRegimeEnum = this.convertToTaxRegimeEnum(createInput.taxRegime);

    const createdFocusNfeIntegration = focusNFeRepository.create({
      ...createInput,
      token: await this.encryptText(createInput.token),
      taxRegime: taxRegimeEnum,
    });

    const createdIntegration = await focusNFeRepository.save(
      createdFocusNfeIntegration,
    );

    if (!createdIntegration.cnpj && !createdIntegration.cpf) {
      throw new Error('FocusNFe repository not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validateDocument = (createdIntegration.cnpj ??
      createdIntegration.cpf)!;

    await this.subscriptionWebhook(
      'nfse',
      validateDocument,
      createdIntegration.token,
      workspaceId,
      createdIntegration.id,
    );
    await this.subscriptionWebhook(
      'nfcom',
      validateDocument,
      createdIntegration.token,
      workspaceId,
      createdIntegration.id,
    );

    return createdIntegration;
  }

  async findAll(workspaceId: string): Promise<FocusNFeWorkspaceEntity[]> {
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    if (!focusNFeRepository) {
      throw new Error('FocusNFe repository not found');
    }

    return await focusNFeRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(
    focusNfeIntegrationId: string,
    workspaceId: string,
  ): Promise<FocusNFeWorkspaceEntity | null> {
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    return await focusNFeRepository.findOne({
      where: { id: focusNfeIntegrationId },
    });
  }

  async update(
    updateInput: UpdateFocusNfeIntegrationInput,
    workspaceId: string,
  ): Promise<FocusNFeWorkspaceEntity> {
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    const focusNfeIntegration = await this.findById(
      updateInput.id,
      workspaceId,
    );

    if (!focusNfeIntegration) {
      throw new Error('Focus NFe integration not found');
    }

    if (updateInput.token) {
      updateInput.token = await this.encryptText(updateInput.token);
    }

    const taxRegimeEnum = this.convertToTaxRegimeEnum(updateInput.taxRegime);

    const updatedFocusNfeIntegration = {
      ...focusNfeIntegration,
      ...updateInput,
      taxRegime: taxRegimeEnum,
    };

    if (focusNfeIntegration.token !== updatedFocusNfeIntegration.token) {
      // TODO: Delete previous webhook and then register again (create delete method)
      await this.subscriptionWebhook(
        'nfse',
        updatedFocusNfeIntegration.cnpj ?? updatedFocusNfeIntegration.cpf,
        updatedFocusNfeIntegration.token,
        workspaceId,
        updatedFocusNfeIntegration.id,
      );
      await this.subscriptionWebhook(
        'nfcom', 
        updatedFocusNfeIntegration.cnpj ?? updatedFocusNfeIntegration.cpf,
        updatedFocusNfeIntegration.token,
        workspaceId,
        updatedFocusNfeIntegration.id,
      );
    }

    return await focusNFeRepository.save(updatedFocusNfeIntegration);
  }

  async delete(
    focusNfeIntegrationId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    if (focusNFeRepository) {
      const { affected } = await focusNFeRepository.delete(
        focusNfeIntegrationId,
      );

      if (!affected) {
        throw new BadRequestException(undefined, {
          description: 'Error when removing Focus NFe Integration',
        });
      }


      return affected ? true : false;
    }

    throw new BadRequestException(undefined, {
      description: 'Focus NFe integration not found',
    });
  }

  async toggleStatus(id: string, workspaceId: string): Promise<void> {
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    const integration = await this.findById(id, workspaceId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    if (integration.status === 'active') {
      integration.status = Status.INACTIVE;
    } else {
      integration.status = Status.ACTIVE;
    }

    await focusNFeRepository.save(integration);
  }

  private async subscriptionWebhook(
    event: string,
    cnpj: string,
    token: string,
    workspaceId: string,
    integrationId: string,
  ) {
    const baseUrl = this.environmentService.get('FOCUS_NFE_BASE_URL');
    const webhookUrl = this.environmentService.get('WEBHOOK_URL');

    const webhook = {
      // TODO: ideal to receive cnpj when adding integration with Focus NF-e (mandatory information)
      cnpj,
      event,
      url: `${webhookUrl}/focus-nfe/webhook/${workspaceId}/${integrationId}/${event}`,
    };

    try {
      const response = await axios.post(`${baseUrl}/hooks`, webhook, {
        auth: {
          username: token,
          password: '',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // TODO: Redo log messages using the logger
      console.log('HTTP code:', response.status);
      console.log('Body:', response.data);
    } catch (error) {
      if (error.response) {
        console.error('Error:', error.response.status);
        console.error('Response:', error.response.data);
      } else {
        console.error('Request error:', error.message);
      }
    }
  }

  private convertToTaxRegimeEnum(taxRegime: string): TaxRegime | null {
    switch (taxRegime) {
      case 'simples_nacional':
        return TaxRegime.SimplesNacional;
      case 'lucro_presumido':
        return TaxRegime.LucroPresumido;
      case 'lucro_real':
        return TaxRegime.LucroReal;
      default:
        return null;
    }
  }
}
