/* @kvoip-woulz proprietary */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { CreateChargeDto } from 'src/engine/core-modules/payment/dtos/create-charge.dto';
import { supportsPaymentMethod } from 'src/engine/core-modules/payment/utils/suports-payment-method.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { PAYMENT_PROVIDER_TOKENS } from '../constants/payment-provider-tokens';
import { ChargeStatus } from '../enums/charge-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentMethodNotSupportedException } from '../exceptions/payment-method-not-supported.exception';
import type { ListChargesResponse } from '../interfaces/payment-provider.interface';
import {
  CancelChargeResponse,
  CreateChargeResponse,
  IPaymentProvider,
  PaymentStatusResponse,
  RefundResponse,
} from '../interfaces/payment-provider.interface';
import {
  PaymentServiceCancelChargeParams,
  PaymentServiceCreateChargeParams,
  PaymentServiceGetBankSlipFileParams,
  PaymentServiceGetChargeStatusParams,
  PaymentServiceListChargesParams,
  PaymentServiceRefundChargeParams,
  PaymentServiceSyncChargeStatusParams,
  PaymentServiceUpdateChargeParams,
} from '../types/payment-service.types';

@Injectable()
export class PaymentService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @Inject(PAYMENT_PROVIDER_TOKENS[PaymentProvider.INTER])
    private readonly interProvider: IPaymentProvider,
    private readonly fileUploadService: FileUploadService,
    private readonly fileService: FileService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  /**
   * Gets available payment methods for a provider
   */
  getAvailablePaymentMethods(provider: PaymentProvider): PaymentMethod[] {
    const paymentProvider = this.getPaymentProvider(provider);
    const capabilities = paymentProvider.capabilities;
    const availableMethods: PaymentMethod[] = [];

    if (capabilities.boleto) availableMethods.push(PaymentMethod.BOLETO);
    if (capabilities.bolepix) availableMethods.push(PaymentMethod.BOLEPIX);
    if (capabilities.pix) availableMethods.push(PaymentMethod.PIX);
    if (capabilities.creditCard)
      availableMethods.push(PaymentMethod.CREDIT_CARD);
    if (capabilities.debitCard) availableMethods.push(PaymentMethod.DEBIT_CARD);
    if (capabilities.bankTransfer)
      availableMethods.push(PaymentMethod.BANK_TRANSFER);

    return availableMethods;
  }

  /**
   * Main method to create a charge using the specified payment provider
   */
  async createCharge({
    workspaceId,
    chargeDto,
    provider,
    integrationId,
  }: PaymentServiceCreateChargeParams): Promise<ChargeWorkspaceEntity> {
    // integrationId: string,
    // Get the appropriate payment provider
    const paymentProvider = this.getPaymentProvider(provider);

    // Check if the provider supports the requested payment method
    if (
      !supportsPaymentMethod(
        paymentProvider.capabilities,
        chargeDto.paymentMethod,
      )
    ) {
      throw new PaymentMethodNotSupportedException(
        provider,
        chargeDto.paymentMethod,
      );
    }

    // Get integration for the workspace and provider
    // This would be implemented based on your integration structure
    await this.validateIntegration(workspaceId, provider);

    let response: CreateChargeResponse;

    // Route to the appropriate payment method
    switch (chargeDto.paymentMethod) {
      case PaymentMethod.BOLETO:
        if (!chargeDto.dueDate) {
          throw new Error('Due date is required for boleto payments');
        }
        // TODO: We should check if there is already a pending charge using boleto
        // since this could cause unecessary boleto charges to be created.
        response = await paymentProvider.createBoletoCharge({
          workspaceId,
          integrationId,
          amount: chargeDto.amount,
          dueDate: chargeDto.dueDate,
          payerInfo: chargeDto.payerInfo,
          description: chargeDto.description,
          metadata: chargeDto.metadata,
        });
        break;
      case PaymentMethod.BOLEPIX:
        response = await paymentProvider.createBolepixCharge({
          workspaceId,
          integrationId,
          amount: chargeDto.amount,
          payerInfo: chargeDto.payerInfo,
          expirationMinutes: chargeDto.expirationMinutes,
          description: chargeDto.description,
          metadata: chargeDto.metadata,
        });
        break;

      case PaymentMethod.PIX:
        response = await paymentProvider.createPixCharge({
          workspaceId,
          integrationId,
          amount: chargeDto.amount,
          payerInfo: chargeDto.payerInfo,
          expirationMinutes: chargeDto.expirationMinutes,
          description: chargeDto.description,
          metadata: chargeDto.metadata,
        });
        break;

      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        if (!chargeDto.cardData) {
          throw new Error('Card data is required for card payments');
        }
        response = await paymentProvider.createCardCharge({
          workspaceId,
          integrationId,
          amount: chargeDto.amount,
          cardData: chargeDto.cardData,
          payerInfo: chargeDto.payerInfo,
          description: chargeDto.description,
          metadata: chargeDto.metadata,
        });
        break;

      default:
        throw new Error(
          `Payment method ${chargeDto.paymentMethod} not supported`,
        );
    }

    // Create and save the ChargeWorkspaceEntity
    const chargeEntity = await this.createChargeEntity(
      workspaceId,
      chargeDto,
      response,
      provider,
    );

    return chargeEntity;
  }

  /**
   * Retrieves bank slip file for a charge, stores it using the file system,
   * and adds it as an attachment to the ChargeWorkspaceEntity
   */
  async getBankSlipFile({
    workspaceId,
    chargeId,
    provider,
    integrationId,
  }: PaymentServiceGetBankSlipFileParams): Promise<{
    charge: ChargeWorkspaceEntity;
    attachment: AttachmentWorkspaceEntity;
    signedFileUrl: string;
  }> {
    const paymentProvider = this.getPaymentProvider(provider);

    const charge = await this.findOneChargeEntityOrThrow(workspaceId, chargeId);

    // Get the bank slip file from the payment provider
    const bankSlipResponse = await paymentProvider.getBankSlipFile({
      workspaceId,
      integrationId,
      charge,
    });

    if (!bankSlipResponse.fileBuffer) {
      throw new Error(
        'Bank slip file buffer is required but was not provided by the payment provider',
      );
    }

    const fileName =
      bankSlipResponse.fileName ||
      `bank-slip-${charge.requestCode || chargeId}.pdf`;

    const { files } = await this.fileUploadService.uploadFile({
      file: bankSlipResponse.fileBuffer,
      fileFolder: FileFolder.ChargeBill,
      workspaceId,
      filename: fileName,
      mimeType: 'application/pdf',
    });

    if (!files.length) {
      throw new Error('Failed to upload bank slip file');
    }

    // Extract fullPath from the uploaded file path (remove token query parameter)
    const extractFullPathFromFilePath = (path: string): string => {
      const matchRegex = /([^?]+)/;
      return path.match(matchRegex)?.[1] || path;
    };

    const fullPath = extractFullPathFromFilePath(files[0].path);

    // Get attachment repository
    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
        { shouldBypassPermissionChecks: true },
      );

    // Create attachment entity linked to the charge
    const attachment = attachmentRepository.create({
      name: fileName,
      fullPath,
      type: 'application/pdf',
      chargeId: charge.id,
    });

    // Save the attachment
    const savedAttachment = await attachmentRepository.save(attachment);

    const chargeWithAttachment = await this.findOneChargeEntityOrThrow(
      workspaceId,
      chargeId,
    );

    const signedPath = this.fileService.signFileUrl({
      url: savedAttachment.fullPath,
      workspaceId,
    });

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    // This link is used to access the file link directly outside the
    // object record page
    // Note: Attachment links expires
    const signedFileUrl = `${serverUrl}/files/${signedPath}`;

    return {
      charge: chargeWithAttachment,
      attachment: savedAttachment,
      signedFileUrl,
    };
  }

  /**
   * Gets the payment status of a charge
   */
  async getChargeStatus({
    workspaceId,
    chargeId,
    provider,
    integrationId,
  }: PaymentServiceGetChargeStatusParams): Promise<PaymentStatusResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    const chargeRepository =
      await this.getChargeWorkspaceRepository(workspaceId);

    const charge = await chargeRepository.findOne({
      where: { id: chargeId },
    });

    if (!charge) {
      throw new NotFoundException(`Charge ${chargeId} not found`);
    }

    return paymentProvider.getChargeStatus({
      workspaceId,
      integrationId,
      charge,
    });
  }

  /**
   * Cancels a pending charge
   */
  async cancelCharge({
    workspaceId,
    chargeId,
    provider,
    reason,
    integrationId,
  }: PaymentServiceCancelChargeParams): Promise<CancelChargeResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    // Check if provider supports cancellation
    if (!paymentProvider.capabilities.cancellation) {
      throw new Error(
        `Provider ${provider} does not support charge cancellation`,
      );
    }

    const charge = await this.findOneChargeEntityOrThrow(workspaceId, chargeId);

    const response = await paymentProvider.cancelCharge({
      workspaceId,
      integrationId,
      charge,
      reason,
    });

    // Update the charge entity in database
    await this.updateChargeStatus(
      workspaceId,
      chargeId,
      ChargeStatus.CANCELLED,
    );

    return response;
  }

  /**
   * Refunds a paid charge (full or partial)
   */
  async refundCharge({
    workspaceId,
    chargeId,
    provider,
    amount,
    reason,
    integrationId,
  }: PaymentServiceRefundChargeParams): Promise<RefundResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    // Check if provider supports refunds
    if (!paymentProvider.capabilities.refunds) {
      throw new Error(`Provider ${provider} does not support refunds`);
    }

    // Check if partial refunds are supported
    if (amount && !paymentProvider.capabilities.partialRefunds) {
      throw new Error(`Provider ${provider} does not support partial refunds`);
    }

    const charge = await this.findOneChargeEntityOrThrow(workspaceId, chargeId);

    const response = await paymentProvider.refundCharge({
      workspaceId,
      integrationId,
      charge,
      amount,
      reason,
    });

    // Update the charge entity in database
    await this.updateChargeStatus(workspaceId, chargeId, ChargeStatus.REFUNDED);

    return response;
  }

  /**
   * Updates charge information
   */
  async updateCharge({
    workspaceId,
    chargeId,
    provider,
    updates,
    integrationId,
  }: PaymentServiceUpdateChargeParams): Promise<CreateChargeResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    const charge = await this.findOneChargeEntityOrThrow(workspaceId, chargeId);

    return paymentProvider.updateCharge({
      workspaceId,
      integrationId,
      charge,
      updates,
    });
  }

  /**
   * Lists all charges for a workspace
   */
  async listCharges({
    workspaceId,
    provider,
    filters,
    integrationId,
  }: PaymentServiceListChargesParams): Promise<ListChargesResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    return paymentProvider.listCharges({
      workspaceId,
      integrationId,
      filters,
    });
  }

  /**
   * Syncs charge status from payment provider
   * Useful for webhooks or scheduled sync jobs
   */
  async syncChargeStatus({
    workspaceId,
    chargeId,
    provider,
    integrationId,
  }: PaymentServiceSyncChargeStatusParams): Promise<ChargeWorkspaceEntity> {
    const statusResponse = await this.getChargeStatus({
      workspaceId,
      chargeId,
      provider,
      integrationId,
    });

    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
        { shouldBypassPermissionChecks: true },
      );

    const charge = await chargeRepository.findOne({
      where: { id: chargeId },
    });

    if (!charge) {
      throw new NotFoundException(`Charge ${chargeId} not found`);
    }

    // Update charge status and related fields
    // This would need to be implemented based on your charge entity structure
    // charge.status = statusResponse.status;
    // if (statusResponse.paidAt) {
    //   charge.paidAt = statusResponse.paidAt;
    // }

    await chargeRepository.save(charge);

    return charge;
  }

  /**
   * Gets the appropriate payment provider based on the provider type
   */
  private getPaymentProvider(provider: PaymentProvider): IPaymentProvider {
    switch (provider) {
      case PaymentProvider.INTER:
        return this.interProvider;
      // Add other providers as they are implemented
      // case PaymentProvider.ASAS:
      //   return this.asasProvider;
      // case PaymentProvider.BRADESCO:
      //   return this.bradescoProvider;
      // case PaymentProvider.STRIPE:
      //   return this.stripeProvider;
      default:
        throw new Error(`Payment provider ${provider} not implemented`);
    }
  }

  /**
   * Validates that an integration exists for the workspace and provider
   */
  private async validateIntegration(
    workspaceId: string,
    provider: PaymentProvider,
  ): Promise<void> {
    // TODO: Implement integration validation
    // This would check if the workspace has an active integration for the provider
    // For example, check InterIntegration for INTER provider
    // Example:
    // const integration = await this.interIntegrationService.findByWorkspaceId(workspaceId);
    // if (!integration || integration.status !== 'active') {
    //   throw new NotFoundException(`No active ${provider} integration found for workspace ${workspaceId}`);
    // }
  }

  /**
   * Creates a ChargeWorkspaceEntity from the payment provider response
   */
  private async createChargeEntity(
    workspaceId: string,
    chargeDto: CreateChargeDto,
    response: CreateChargeResponse,
    provider: PaymentProvider,
  ): Promise<ChargeWorkspaceEntity> {
    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
        { shouldBypassPermissionChecks: true },
      );

    const charge = chargeRepository.create({
      name: chargeDto.description || 'Payment',
      price: chargeDto.amount,
      quantity: 1,
      taxId: chargeDto.payerInfo.taxId,
      requestCode: response.externalChargeId,
      // TODO: Add other fields based on your ChargeWorkspaceEntity structure
      // status: response.status,
      // paymentMethod: response.paymentMethod,
      // dueDate: response.dueDate,
    });

    const savedCharge = await chargeRepository.save(charge);

    return savedCharge;
  }

  /**
   * Finds a charge entity by id
   */
  private async findOneChargeEntity(
    workspaceId: string,
    chargeId: string,
  ): Promise<ChargeWorkspaceEntity | null> {
    const chargeRepository =
      await this.getChargeWorkspaceRepository(workspaceId);

    return await chargeRepository.findOne({
      where: { id: chargeId },
      relations: ['attachments'],
    });
  }

  /**
   * Finds a charge entity by id or throws an error if not found
   */
  private async findOneChargeEntityOrThrow(
    workspaceId: string,
    chargeId: string,
  ): Promise<ChargeWorkspaceEntity> {
    const charge = await this.findOneChargeEntity(workspaceId, chargeId);

    if (!charge) {
      throw new NotFoundException(`Charge ${chargeId} not found`);
    }

    return charge;
  }

  /**
   * Updates the status of a charge
   */
  private async updateChargeStatus(
    workspaceId: string,
    chargeId: string,
    status: ChargeStatus,
  ): Promise<void> {
    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
        { shouldBypassPermissionChecks: true },
      );

    await chargeRepository.update(chargeId, {
      // TODO: Implement update charge status
      // status,  // This would need to match your actual entity field
    });
  }

  /**
   * Gets the charge workspace repository
   */
  private async getChargeWorkspaceRepository(
    workspaceId: string,
  ): Promise<WorkspaceRepository<ChargeWorkspaceEntity>> {
    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
        { shouldBypassPermissionChecks: true },
      );

    if (!chargeRepository) {
      throw new NotFoundException(
        `Charge repository not found for workspace ${workspaceId}`,
      );
    }

    return chargeRepository;
  }
}
