/* @kvoip-woulz proprietary */
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';

import { ChargeStatus } from 'src/engine/core-modules/payment/enums/charge-status.enum';
import { PaymentMethod } from 'src/engine/core-modules/payment/enums/payment-method.enum';
import { PaymentProviderCapabilities } from 'src/engine/core-modules/payment/interfaces/payment-provider-capabilities.interface';
import {
  BankSlipResponse,
  CancelChargeResponse,
  CardData,
  CreateChargeResponse,
  IPaymentProvider,
  PayerInfo,
  PaymentStatusResponse,
  RefundResponse,
} from 'src/engine/core-modules/payment/interfaces/payment-provider.interface';

/**
 * ASAS (Asaas) payment provider implementation
 * TODO: Implement ASAS payment provider methods
 */
@Injectable()
export class AsasPaymentProviderService implements IPaymentProvider {
  private readonly logger = new Logger(AsasPaymentProviderService.name);

  /**
   * ASAS capabilities (when implemented)
   * ASAS typically supports a wide range of payment methods
   */
  readonly capabilities: PaymentProviderCapabilities = {
    // Payment methods - To be confirmed when implementing
    boleto: true,
    bolepix: false,
    pix: true,
    creditCard: true,
    debitCard: true,
    bankTransfer: false,

    // Operations - To be confirmed when implementing
    refunds: true,
    partialRefunds: true,
    cancellation: true,
    updates: true,
    statusQuery: true,
    listCharges: true,

    // Features - To be confirmed when implementing
    installments: true,
    recurring: true,
    webhooks: true,
  };

  async createBoletoCharge(
    workspaceId: string,
    amount: number,
    dueDate: Date,
    payerInfo: PayerInfo,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('ASAS provider not yet implemented');
  }

  async createPixCharge(
    workspaceId: string,
    amount: number,
    payerInfo: PayerInfo,
    expirationMinutes?: number,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('ASAS provider not yet implemented');
  }

  async createCardCharge(
    workspaceId: string,
    amount: number,
    cardData: CardData,
    payerInfo: PayerInfo,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('ASAS provider not yet implemented');
  }

  async getBankSlipFile(
    workspaceId: string,
    chargeId: string,
  ): Promise<BankSlipResponse> {
    throw new NotImplementedException('ASAS provider not yet implemented');
  }

  async getChargeStatus(
    workspaceId: string,
    chargeId: string,
  ): Promise<PaymentStatusResponse> {
    throw new NotImplementedException('ASAS provider not yet implemented');
  }

  async cancelCharge(
    workspaceId: string,
    chargeId: string,
    reason?: string,
  ): Promise<CancelChargeResponse> {
    throw new NotImplementedException('ASAS provider not yet implemented');
  }

  async refundCharge(
    workspaceId: string,
    chargeId: string,
    amount?: number,
    reason?: string,
  ): Promise<RefundResponse> {
    throw new NotImplementedException('ASAS provider not yet implemented');
  }

  async updateCharge(
    workspaceId: string,
    chargeId: string,
    updates: Partial<{
      amount: number;
      dueDate: Date;
      description: string;
    }>,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('ASAS provider not yet implemented');
  }

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
    throw new NotImplementedException('ASAS provider not yet implemented');
  }
}
