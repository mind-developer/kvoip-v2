/* @kvoip-woulz proprietary */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';

import { CreateChargeDto } from 'src/engine/core-modules/payment/dtos/create-charge.dto';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { PAYMENT_PROVIDER_TOKENS } from '../constants/payment-provider-tokens';
import { ChargeStatus } from '../enums/charge-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import {
  BankSlipResponse,
  CancelChargeResponse,
  CreateChargeResponse,
  IPaymentProvider,
  PaymentStatusResponse,
  RefundResponse,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class PaymentService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @Inject(PAYMENT_PROVIDER_TOKENS[PaymentProvider.INTER])
    private readonly interProvider: IPaymentProvider,
  ) {}

  /**
   * Main method to create a charge using the specified payment provider
   */
  async createCharge(
    workspaceId: string,
    // integrationId: string,
    chargeDto: CreateChargeDto,
    provider: PaymentProvider,
  ): Promise<ChargeWorkspaceEntity> {
    // Get the appropriate payment provider
    const paymentProvider = this.getPaymentProvider(provider);

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
        response = await paymentProvider.createBoletoCharge(
          workspaceId,
          chargeDto.amount,
          chargeDto.dueDate,
          chargeDto.payerInfo,
          chargeDto.description,
          chargeDto.metadata,
        );
        break;

      case PaymentMethod.PIX:
        response = await paymentProvider.createPixCharge(
          workspaceId,
          chargeDto.amount,
          chargeDto.payerInfo,
          chargeDto.expirationMinutes,
          chargeDto.description,
          chargeDto.metadata,
        );
        break;

      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        if (!chargeDto.cardData) {
          throw new Error('Card data is required for card payments');
        }
        response = await paymentProvider.createCardCharge(
          workspaceId,
          chargeDto.amount,
          chargeDto.cardData,
          chargeDto.payerInfo,
          chargeDto.description,
          chargeDto.metadata,
        );
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
   * Retrieves bank slip file for a charge
   */
  async getBankSlipFile(
    workspaceId: string,
    chargeId: string,
    provider: PaymentProvider,
  ): Promise<BankSlipResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    return paymentProvider.getBankSlipFile(workspaceId, chargeId);
  }

  /**
   * Gets the payment status of a charge
   */
  async getChargeStatus(
    workspaceId: string,
    chargeId: string,
    provider: PaymentProvider,
  ): Promise<PaymentStatusResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    return paymentProvider.getChargeStatus(workspaceId, chargeId);
  }

  /**
   * Cancels a pending charge
   */
  async cancelCharge(
    workspaceId: string,
    chargeId: string,
    provider: PaymentProvider,
    reason?: string,
  ): Promise<CancelChargeResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    const response = await paymentProvider.cancelCharge(
      workspaceId,
      chargeId,
      reason,
    );

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
  async refundCharge(
    workspaceId: string,
    chargeId: string,
    provider: PaymentProvider,
    amount?: number,
    reason?: string,
  ): Promise<RefundResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    const response = await paymentProvider.refundCharge(
      workspaceId,
      chargeId,
      amount,
      reason,
    );

    // Update the charge entity in database
    await this.updateChargeStatus(workspaceId, chargeId, ChargeStatus.REFUNDED);

    return response;
  }

  /**
   * Updates charge information
   */
  async updateCharge(
    workspaceId: string,
    chargeId: string,
    provider: PaymentProvider,
    updates: Partial<{
      amount: number;
      dueDate: Date;
      description: string;
    }>,
  ): Promise<CreateChargeResponse> {
    const paymentProvider = this.getPaymentProvider(provider);

    return paymentProvider.updateCharge(workspaceId, chargeId, updates);
  }

  /**
   * Lists all charges for a workspace
   */
  async listCharges(
    workspaceId: string,
    provider: PaymentProvider,
    filters?: {
      status?: ChargeStatus;
      paymentMethod?: PaymentMethod;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{
    charges: CreateChargeResponse[];
    total: number;
    hasMore: boolean;
  }> {
    const paymentProvider = this.getPaymentProvider(provider);

    return paymentProvider.listCharges(workspaceId, filters);
  }

  /**
   * Syncs charge status from payment provider
   * Useful for webhooks or scheduled sync jobs
   */
  async syncChargeStatus(
    workspaceId: string,
    chargeId: string,
    provider: PaymentProvider,
  ): Promise<ChargeWorkspaceEntity> {
    const statusResponse = await this.getChargeStatus(
      workspaceId,
      chargeId,
      provider,
    );

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
      // TODO: Add other fields based on your ChargeWorkspaceEntity structure
      // requestCode: response.externalChargeId,
      // status: response.status,
      // paymentMethod: response.paymentMethod,
      // dueDate: response.dueDate,
    });

    await chargeRepository.save(charge);

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
}
