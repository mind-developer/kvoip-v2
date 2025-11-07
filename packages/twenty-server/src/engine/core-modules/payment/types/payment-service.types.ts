/* @kvoip-woulz proprietary */
import { CreateChargeDto } from '../dtos/create-charge.dto';
import { ChargeStatus } from '../enums/charge-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';

export type PaymentServiceChargeParams = {
  workspaceId: string;
  provider: PaymentProvider;
  /**
   * Integration ID to use for the charge.
   * Note: If not provided, the first integration will be used.
   */
  integrationId?: string;
};

export type PaymentServiceCreateChargeParams = PaymentServiceChargeParams & {
  chargeDto: CreateChargeDto;
};

export type PaymentServiceChargeGetParams = PaymentServiceChargeParams & {
  chargeId: string;
};

export type PaymentServiceGetBankSlipFileParams = PaymentServiceChargeGetParams;

export type PaymentServiceGetChargeStatusParams = PaymentServiceChargeGetParams;

export type PaymentServiceCancelChargeParams = PaymentServiceChargeGetParams & {
  reason?: string;
};

export type PaymentServiceRefundChargeParams = PaymentServiceChargeGetParams & {
  amount?: number;
  reason?: string;
};

export type PaymentServiceUpdateChargeParams = PaymentServiceChargeGetParams & {
  updates: Partial<{
    amount: number;
    dueDate: Date;
    description: string;
  }>;
};

export type PaymentServiceListChargesFilters = {
  status?: ChargeStatus;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};

export type PaymentServiceListChargesParams = PaymentServiceChargeParams & {
  filters?: PaymentServiceListChargesFilters;
};

export type PaymentServiceSyncChargeStatusParams =
  PaymentServiceChargeGetParams;
