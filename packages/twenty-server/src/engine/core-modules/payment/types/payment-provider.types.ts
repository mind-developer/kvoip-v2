/* @kvoip-woulz proprietary */
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
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
  zipCode: string;
  street: string;
  city: string;
  state: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
};

export type Customer = {
  name: string;
  email: string;
  taxId: string; // CPF or CNPJ
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
  charge: ChargeWorkspaceEntity;
};

export type GetChargeStatusParams = WorkspaceScopedParams & {
  charge: ChargeWorkspaceEntity;
};

export type CancelChargeParams = WorkspaceScopedParams & {
  charge: ChargeWorkspaceEntity;
  reason?: string;
};

export type RefundChargeParams = WorkspaceScopedParams & {
  charge: ChargeWorkspaceEntity;
  amount?: number;
  reason?: string;
};

export type UpdateChargeParams = WorkspaceScopedParams & {
  charge: ChargeWorkspaceEntity;
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
  charge: ChargeWorkspaceEntity;
  externalChargeId: string;
  status: ChargeStatus;
  paidAt?: Date;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, any>;
};

export type RefundResponse = {
  refundId: string;
  charge: ChargeWorkspaceEntity;
  amount: number;
  status: ChargeStatus;
  refundedAt?: Date;
  metadata?: Record<string, any>;
};

export type CancelChargeResponse = {
  charge: ChargeWorkspaceEntity;
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
