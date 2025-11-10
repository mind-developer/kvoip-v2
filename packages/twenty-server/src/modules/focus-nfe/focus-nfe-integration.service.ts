/* @kvoip-woulz proprietary */
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

import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FieldMetadataRelationSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

type FocusNfeIntegrationInput =
  | CreateFocusNfeIntegrationInput
  | UpdateFocusNfeIntegrationInput;

@Injectable()
export class FocusNFeIntegrationService {
  private readonly logger = new Logger(FocusNFeIntegrationService.name);

  constructor(
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async encryptText(text: string): Promise<string> {
    const secretKey = this.environmentService.get('FOCUS_NFE_ENCRYPTION_KEY');

    if (!secretKey) {
      this.logger.warn(
        'FOCUS_NFE_ENCRYPTION_KEY not configured, token will not be encrypted',
      );
      return text;
    }
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

    if (!secretKey) {
      this.logger.warn(
        'FOCUS_NFE_ENCRYPTION_KEY not configured, token will not be decrypted',
      );
      return cipherText;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Decryption resulted in empty string');
      }

      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt token', error);
      throw new BadRequestException('Failed to decrypt token');
    }
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
      throw new NotFoundException('FocusNFe repository not found'); // @kvoip-woulz proprietary
    }

    const validatedInput = await this.validateInput(createInput, workspaceId);

    const taxRegimeEnum = this.convertToTaxRegimeEnum(validatedInput.taxRegime);

    const createdFocusNfeIntegration = focusNFeRepository.create({
      ...validatedInput,
      // token: await this.encryptText(validatedInput.token),
      token: validatedInput.token,
      taxRegime: taxRegimeEnum,
    });

    const createdIntegration: FocusNFeWorkspaceEntity =
      (await focusNFeRepository.save(
        createdFocusNfeIntegration,
      )) as FocusNFeWorkspaceEntity;

    if (!createdIntegration.cnpj && !createdIntegration.cpf) {
      throw new BadRequestException('Either CNPJ or CPF must be provided');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validateDocument = (createdIntegration.cnpj ??
      createdIntegration.cpf)!;

    await Promise.all([
      this.subscriptionWebhook(
        'nfse',
        validateDocument,
        createdIntegration.token,
        workspaceId,
        createdIntegration.id,
      ),
      this.subscriptionWebhook(
        'nfcom',
        validateDocument,
        createdIntegration.token,
        workspaceId,
        createdIntegration.id,
      ),
    ]);

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
      throw new NotFoundException('FocusNFe repository not found');
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

    if (!focusNFeRepository) {
      throw new NotFoundException('FocusNFe repository not found');
    }

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

    if (!focusNFeRepository) {
      throw new NotFoundException('FocusNFe repository not found');
    }

    const focusNfeIntegration = await this.findById(
      updateInput.id,
      workspaceId,
    );

    if (!focusNfeIntegration) {
      throw new NotFoundException('Focus NFe integration not found');
    }

    const validatedInput = await this.validateInput(updateInput, workspaceId);

    // if (validatedInput.token) {
    //   validatedInput.token = await this.encryptText(validatedInput.token);
    // }

    this.logger.log(`validatedInput: ${JSON.stringify(validatedInput, null, 2)}`);
    this.logger.log(`tok: ${validatedInput.token}`);

    const taxRegimeEnum = this.convertToTaxRegimeEnum(validatedInput.taxRegime);

    const updatedFocusNfeIntegration: FocusNFeWorkspaceEntity = {
      ...focusNfeIntegration,
      ...validatedInput,
      taxRegime: taxRegimeEnum,
    };

    if (
      validatedInput.token &&
      focusNfeIntegration.token !== updatedFocusNfeIntegration.token
    ) {
      // TODO: Delete previous webhook and then register again (create delete method)
      const validateDocument =
        updatedFocusNfeIntegration.cnpj ?? updatedFocusNfeIntegration.cpf;

      if (!validateDocument) {
        throw new BadRequestException('Either CNPJ or CPF must be provided');
      }

      await Promise.all([
        this.subscriptionWebhook(
          'nfse',
          validateDocument,
          updatedFocusNfeIntegration.token,
          workspaceId,
          updatedFocusNfeIntegration.id,
        ),
        this.subscriptionWebhook(
          'nfcom',
          validateDocument,
          updatedFocusNfeIntegration.token,
          workspaceId,
          updatedFocusNfeIntegration.id,
        ),
      ]);
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

    if (!focusNFeRepository) {
      throw new NotFoundException('FocusNFe repository not found');
    }

    const { affected } = await focusNFeRepository.delete(focusNfeIntegrationId);

    if (!affected) {
      throw new NotFoundException(
        'Focus NFe integration not found or already deleted',
      );
    }

    return true;
  }

  async toggleStatus(id: string, workspaceId: string): Promise<void> {
    const focusNFeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FocusNFeWorkspaceEntity>(
        workspaceId,
        'focusNFe',
        { shouldBypassPermissionChecks: true },
      );

    if (!focusNFeRepository) {
      throw new NotFoundException('FocusNFe repository not found');
    }

    const integration = await this.findById(id, workspaceId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    integration.status =
      integration.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

    await focusNFeRepository.save(integration);
  }

  private async validateInput<T extends FocusNfeIntegrationInput>(
    input: T,
    workspaceId: string,
  ): Promise<T> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: 'focusNFe' },
        relations: ['fields'],
      });

    if (!objectMetadata) {
      throw new NotFoundException('FocusNFe object metadata not found');
    }

    const fieldIdByName: Record<string, string> = {};
    const fieldsById: Record<string, FieldMetadataEntity> = {};
    const fieldIdByJoinColumnName: Record<string, string> = {};

    objectMetadata.fields.forEach((field) => {
      fieldIdByName[field.name] = field.id;
      fieldsById[field.id] = field;

      if (field.type === 'RELATION') {
        const relationSettings =
          field.settings as FieldMetadataRelationSettings;

        if (relationSettings?.joinColumnName) {
          fieldIdByJoinColumnName[relationSettings.joinColumnName] = field.id;
        }
      }
    });

    const transformedInput = await this.recordInputTransformerService.process({
      recordInput: input,
      objectMetadataMapItem: {
        ...objectMetadata,
        fieldIdByName,
        fieldsById,
        fieldIdByJoinColumnName,
      },
    });

    return transformedInput as T;
  }

  private async subscriptionWebhook(
    event: string,
    cnpj: string,
    token: string,
    workspaceId: string,
    integrationId: string,
  ): Promise<void> {
    const baseUrl = this.environmentService.get('FOCUS_NFE_BASE_URL');
    const webhookUrl = this.environmentService.get('WEBHOOK_URL');

    if (!baseUrl || !webhookUrl) {
      this.logger.warn(
        'FOCUS_NFE_BASE_URL or WEBHOOK_URL not configured, skipping webhook subscription',
      );
      return;
    }

    const webhook = {
      // TODO: ideal to receive cnpj when adding integration with Focus NF-e (mandatory information)
      cnpj,
      event,
      url: `${webhookUrl}/focus-nfe/webhook/${workspaceId}/${integrationId}/${event}`,
    };

    this.logger.log(`baseUrl: ${baseUrl}`);
    this.logger.log(`token: ${token}`);
    this.logger.log(`workspaceId: ${workspaceId}`);
    this.logger.log(`integrationId: ${integrationId}`);
    this.logger.log(`webhookUrl: ${webhookUrl}`);

    try {
      const response = await axios.post(`${baseUrl}/hooks`, webhook, {
        auth: {
          username: token,
          password: '',
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      this.logger.log(
        `Webhook subscription successful for ${event} - Status: ${response.status}`,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Webhook subscription failed for ${event} - Status: ${error.response?.status}`,
          error.response?.data,
        );
      } else {
        this.logger.error(
          `Webhook subscription request error for ${event}`,
          error,
        );
      }
    }
  }

  private convertToTaxRegimeEnum(taxRegime: string): TaxRegime | null {
    const taxRegimeMap: Record<string, TaxRegime> = {
      simples_nacional: TaxRegime.SimplesNacional,
      lucro_presumido: TaxRegime.LucroPresumido,
      lucro_real: TaxRegime.LucroReal,
    };

    return taxRegimeMap[taxRegime] ?? null;
  }
}
