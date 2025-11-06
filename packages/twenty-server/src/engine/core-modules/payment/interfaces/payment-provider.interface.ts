import { ChargeStatus } from '../enums/charge-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

/**
 * Card data for credit/debit card payments
 */
export type CardData = {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  installments?: number;
};

/**
 * Payer information for charges
 */
export type PayerInfo = {
  name: string;
  email: string;
  taxId: string; // CPF or CNPJ for Brazil
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
};

/**
 * Generic response from creating a charge
 */
export type CreateChargeResponse = {
  chargeId: string;
  externalChargeId: string; // ID from the payment provider
  status: ChargeStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  dueDate?: Date;
  boletoUrl?: string; // URL to download bank slip (boleto)
  boletoBarcode?: string; // Barcode for payment
  pixQrCode?: string; // QR code for PIX payment
  pixQrCodeText?: string; // Text version of PIX QR code
  paymentUrl?: string; // URL to redirect user for payment
  metadata?: Record<string, any>;
};

/**
 * Bank slip (boleto) file response
 */
export type BankSlipResponse = {
  fileUrl?: string;
  fileBuffer?: Buffer;
  fileName?: string;
  barcode?: string;
};

/**
 * Payment status response
 */
export type PaymentStatusResponse = {
  chargeId: string;
  externalChargeId: string;
  status: ChargeStatus;
  paidAt?: Date;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, any>;
};

/**
 * Refund response
 */
export type RefundResponse = {
  refundId: string;
  chargeId: string;
  amount: number;
  status: ChargeStatus;
  refundedAt?: Date;
  metadata?: Record<string, any>;
};

/**
 * Cancel charge response
 */
export type CancelChargeResponse = {
  chargeId: string;
  externalChargeId: string;
  status: ChargeStatus;
  cancelledAt?: Date;
  metadata?: Record<string, any>;
};

/**
 * Main interface that all payment providers must implement
 */
export interface IPaymentProvider {
  /**
   * Creates a bank slip (boleto) charge
   */
  createBoletoCharge(
    workspaceId: string,
    amount: number,
    dueDate: Date,
    payerInfo: PayerInfo,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<CreateChargeResponse>;

  /**
   * Creates a PIX charge
   */
  createPixCharge(
    workspaceId: string,
    amount: number,
    payerInfo: PayerInfo,
    expirationMinutes?: number,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<CreateChargeResponse>;

  /**
   * Creates a credit/debit card charge
   */
  createCardCharge(
    workspaceId: string,
    amount: number,
    cardData: CardData,
    payerInfo: PayerInfo,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<CreateChargeResponse>;

  /**
   * Retrieves bank slip file (PDF)
   */
  getBankSlipFile(
    workspaceId: string,
    chargeId: string,
  ): Promise<BankSlipResponse>;

  /**
   * Gets the payment status of a charge
   */
  getChargeStatus(
    workspaceId: string,
    chargeId: string,
  ): Promise<PaymentStatusResponse>;

  /**
   * Cancels a pending charge
   */
  cancelCharge(
    workspaceId: string,
    chargeId: string,
    reason?: string,
  ): Promise<CancelChargeResponse>;

  /**
   * Refunds a paid charge (full or partial)
   */
  refundCharge(
    workspaceId: string,
    chargeId: string,
    amount?: number,
    reason?: string,
  ): Promise<RefundResponse>;

  /**
   * Updates charge information (e.g., due date, amount)
   */
  updateCharge(
    workspaceId: string,
    chargeId: string,
    updates: Partial<{
      amount: number;
      dueDate: Date;
      description: string;
    }>,
  ): Promise<CreateChargeResponse>;

  /**
   * Lists all charges for a workspace
   */
  listCharges(
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
  }>;
}
