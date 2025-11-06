/* @kvoip-woulz proprietary */
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';

import { InterApiClientService } from 'src/engine/core-modules/inter/services/inter-api-client.service';
import { ChargeStatus } from 'src/engine/core-modules/payment/enums/charge-status.enum';
import { PaymentMethod } from 'src/engine/core-modules/payment/enums/payment-method.enum';
import { PaymentProviderCapabilities } from 'src/engine/core-modules/payment/interfaces/payment-provider-capabilities.interface';
import {
  BankSlipResponse,
  CancelChargeResponse,
  CreateChargeResponse,
  IPaymentProvider,
  PayerInfo,
  PaymentStatusResponse,
  RefundResponse,
} from 'src/engine/core-modules/payment/interfaces/payment-provider.interface';

/**
 * Inter Bank payment provider implementation
 * Implements the IPaymentProvider interface using Inter's banking API
 */
@Injectable()
export class InterPaymentProviderService implements IPaymentProvider {
  private readonly logger = new Logger(InterPaymentProviderService.name);

  /**
   * Inter Bank capabilities
   * Inter supports Bolepix (Boleto + PIX combo) but not standalone Boleto or PIX
   * No credit/debit card support in the current API
   */
  readonly capabilities: PaymentProviderCapabilities = {
    // Payment methods
    boleto: false, // Inter uses Bolepix (combined)
    bolepix: true, // Inter's main payment method (Boleto + PIX combo)
    pix: false, // Included in Bolepix
    creditCard: false, // Not supported by Inter API
    debitCard: false, // Not supported by Inter API
    bankTransfer: false,

    // Operations
    refunds: false, // TODO: Check if Inter API supports refunds
    partialRefunds: false,
    cancellation: false, // TODO: Check if Inter API supports cancellation
    updates: false, // TODO: Check if Inter API supports updates
    statusQuery: false, // Inter uses webhooks for status updates
    listCharges: false, // Inter doesn't provide a list charges endpoint

    // Features
    installments: false,
    recurring: false,
    webhooks: true, // Inter sends webhook events for status updates
  };

  constructor(private readonly interApiClient: InterApiClientService) {}

  /**
   * Creates a boleto (bank slip) charge using Inter's API
   */
  async createBoletoCharge(
    workspaceId: string,
    amount: number,
    dueDate: Date,
    payerInfo: PayerInfo,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<CreateChargeResponse> {
    this.logger.log(
      `Creating boleto charge for workspace ${workspaceId}, amount: ${amount}`,
    );

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Creates a PIX charge using Inter's API
   * Note: Does all boleto generated have a pix option?
   */
  async createPixCharge(
    workspaceId: string,
    amount: number,
    payerInfo: PayerInfo,
    expirationMinutes: number = 30,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<CreateChargeResponse> {
    this.logger.log(
      `Creating PIX charge for workspace ${workspaceId}, amount: ${amount}`,
    );

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Creates a credit/debit card charge
   * Note: This method is not supported by Inter API.
   */
  async createCardCharge(): Promise<CreateChargeResponse> {
    throw new NotImplementedException(
      'Card payments not supported by Inter API. Use a different payment method or provider.',
    );
  }

  /**
   * Retrieves bank slip file (PDF)
   */
  async getBankSlipFile(
    workspaceId: string,
    chargeId: string,
  ): Promise<BankSlipResponse> {
    throw new NotImplementedException('Not implemented');
  }

  /**
   * Gets the payment status of a charge
   * Note: Inter's webhook would typically handle status updates
   * This method would need to query Inter's API for charge status
   */
  async getChargeStatus(
    workspaceId: string,
    chargeId: string,
  ): Promise<PaymentStatusResponse> {
    throw new NotImplementedException('Not implemented');
  }

  /**
   * Cancels a pending charge
   */
  async cancelCharge(
    workspaceId: string,
    chargeId: string,
    reason?: string,
  ): Promise<CancelChargeResponse> {
    throw new NotImplementedException('Not implemented');
  }

  /**
   * Refunds a paid charge
   */
  async refundCharge(
    workspaceId: string,
    chargeId: string,
    amount?: number,
    reason?: string,
  ): Promise<RefundResponse> {
    throw new NotImplementedException('Not implemented');
  }

  /**
   * Updates charge information
   */
  async updateCharge(
    workspaceId: string,
    chargeId: string,
    updates: Partial<{
      amount: number;
      dueDate: Date;
      description: string;
    }>,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('Not implemented');
  }

  /**
   * Lists all charges for a workspace
   */
  async listCharges(
    workspaceId: string,
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
    throw new NotImplementedException('Not implemented');
  }
}
