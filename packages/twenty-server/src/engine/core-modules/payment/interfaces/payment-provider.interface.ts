/* @kvoip-woulz proprietary */
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
  ListChargesParams,
  ListChargesResponse,
  PaymentStatusResponse,
  RefundChargeParams,
  RefundResponse,
  UpdateChargeParams,
} from '../types/payment-provider.types';
import { PaymentProviderCapabilities } from './payment-provider-capabilities.interface';

export type {
  BankSlipResponse,
  CancelChargeParams,
  CancelChargeResponse,
  CardData,
  CreateBolepixChargeParams,
  CreateBoletoChargeParams,
  CreateCardChargeParams,
  CreateChargeResponse,
  CreatePixChargeParams,
  Customer,
  GetBankSlipFileParams,
  GetChargeStatusParams,
  ListChargesParams,
  ListChargesResponse,
  PaymentStatusResponse,
  RefundChargeParams,
  RefundResponse,
  UpdateChargeParams,
} from '../types/payment-provider.types';

/**
 * Main interface that all payment providers must implement
 */
export interface IPaymentProvider {
  /**
   * Capabilities supported by this provider
   * Check these before calling methods to provide better UX
   */
  readonly capabilities: PaymentProviderCapabilities;

  /**
   * Creates a bank slip (boleto) charge
   */
  createBoletoCharge(
    params: CreateBoletoChargeParams,
  ): Promise<CreateChargeResponse>;

  /**
   * Creates a PIX charge
   */
  createPixCharge(params: CreatePixChargeParams): Promise<CreateChargeResponse>;

  /**
   * Creates a PIX charge
   */
  createBolepixCharge(
    params: CreateBolepixChargeParams,
  ): Promise<CreateChargeResponse>;

  /**
   * Creates a credit/debit card charge
   */
  createCardCharge(
    params: CreateCardChargeParams,
  ): Promise<CreateChargeResponse>;

  /**
   * Retrieves bank slip file (PDF)
   */
  getBankSlipFile(params: GetBankSlipFileParams): Promise<BankSlipResponse>;

  /**
   * Gets the payment status of a charge
   */
  getChargeStatus(
    params: GetChargeStatusParams,
  ): Promise<PaymentStatusResponse>;

  /**
   * Cancels a pending charge
   */
  cancelCharge(params: CancelChargeParams): Promise<CancelChargeResponse>;

  /**
   * Refunds a paid charge (full or partial)
   */
  refundCharge(params: RefundChargeParams): Promise<RefundResponse>;

  /**
   * Updates charge information (e.g., due date, amount)
   */
  updateCharge(params: UpdateChargeParams): Promise<CreateChargeResponse>;

  /**
   * Lists all charges for a workspace
   */
  listCharges(params: ListChargesParams): Promise<ListChargesResponse>;
}
