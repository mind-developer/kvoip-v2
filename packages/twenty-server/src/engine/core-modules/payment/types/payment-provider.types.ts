/* @kvoip-woulz proprietary */
import { ChargeStatus } from '../enums/charge-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export type CardData = {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  installments?: number;
};

export type CustomerAddress = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

export type Customer = {
  name: string;
  email: string;
  taxId: string;
  phone?: string;
  address?: CustomerAddress;
};

type WorkspaceScopedParams = {
  workspaceId: string;
  integrationId?: string;
};

export type CreateBoletoChargeParams = WorkspaceScopedParams & {
  amount: number;
  dueDate: Date;
  payerInfo: Customer;
  description?: string;
  metadata?: Record<string, any>;
};

export type CreatePixChargeParams = WorkspaceScopedParams & {
  amount: number;
  payerInfo: Customer;
  expirationMinutes?: number;
  description?: string;
  metadata?: Record<string, any>;
};

export type CreateBolepixChargeParams = WorkspaceScopedParams & {
  amount: number;
  payerInfo: Customer;
  expirationMinutes?: number;
  description?: string;
  metadata?: Record<string, any>;
};

export type CreateCardChargeParams = WorkspaceScopedParams & {
  amount: number;
  cardData: CardData;
  payerInfo: Customer;
  description?: string;
  metadata?: Record<string, any>;
};

export type GetBankSlipFileParams = WorkspaceScopedParams & {
  chargeId: string;
};

export type GetChargeStatusParams = WorkspaceScopedParams & {
  chargeId: string;
};

export type CancelChargeParams = WorkspaceScopedParams & {
  chargeId: string;
  reason?: string;
};

export type RefundChargeParams = WorkspaceScopedParams & {
  chargeId: string;
  amount?: number;
  reason?: string;
};

export type UpdateChargeParams = WorkspaceScopedParams & {
  chargeId: string;
  updates: Partial<{
    amount: number;
    dueDate: Date;
    description: string;
  }>;
};

export type ListChargesParams = WorkspaceScopedParams & {
  filters?: {
    status?: ChargeStatus;
    paymentMethod?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  };
};

export type CreateChargeResponse = {
  chargeId: string;
  externalChargeId: string;
  status: ChargeStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  dueDate?: Date;
  boletoUrl?: string;
  boletoBarcode?: string;
  pixQrCode?: string;
  pixQrCodeText?: string;
  paymentUrl?: string;
  metadata?: Record<string, any>;
};

export type BankSlipResponse = {
  fileUrl?: string;
  fileBuffer?: Buffer;
  fileName?: string;
  barcode?: string;
};

export type PaymentStatusResponse = {
  chargeId: string;
  externalChargeId: string;
  status: ChargeStatus;
  paidAt?: Date;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, any>;
};

export type RefundResponse = {
  refundId: string;
  chargeId: string;
  amount: number;
  status: ChargeStatus;
  refundedAt?: Date;
  metadata?: Record<string, any>;
};

export type CancelChargeResponse = {
  chargeId: string;
  externalChargeId: string;
  status: ChargeStatus;
  cancelledAt?: Date;
  metadata?: Record<string, any>;
};

export type ListChargesResponse = {
  charges: CreateChargeResponse[];
  total: number;
  hasMore: boolean;
};
