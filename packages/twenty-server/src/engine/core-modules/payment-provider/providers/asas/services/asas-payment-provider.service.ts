/* @kvoip-woulz proprietary */
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { PaymentProviderCapabilities } from 'src/engine/core-modules/payment/interfaces/payment-provider-capabilities.interface';

import {
  BankSlipResponse,
  CancelChargeParams,
  CancelChargeResponse,
  CreateBolepixChargeParams,
  CreateBoletoChargeParams,
  CreateCardChargeParams,
  CreateChargeResponse,
  CreatePixChargeParams,
  GetBankSlipFileParams,
  GetChargeStatusParams,
  IPaymentProvider,
  ListChargesParams,
  ListChargesResponse,
  PaymentStatusResponse,
  RefundChargeParams,
  RefundResponse,
  UpdateChargeParams,
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

  createBoletoCharge(
    _params: CreateBoletoChargeParams,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  createPixCharge(
    _params: CreatePixChargeParams,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  createBolepixCharge(
    _params: CreateBolepixChargeParams,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  createCardCharge(
    _params: CreateCardChargeParams,
  ): Promise<CreateChargeResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  getBankSlipFile(_params: GetBankSlipFileParams): Promise<BankSlipResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  getChargeStatus(
    _params: GetChargeStatusParams,
  ): Promise<PaymentStatusResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  cancelCharge(_params: CancelChargeParams): Promise<CancelChargeResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  refundCharge(_params: RefundChargeParams): Promise<RefundResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  updateCharge(_params: UpdateChargeParams): Promise<CreateChargeResponse> {
    throw new NotImplementedException('Method not implemented.');
  }

  listCharges(_params: ListChargesParams): Promise<ListChargesResponse> {
    throw new NotImplementedException('Method not implemented.');
  }
}
