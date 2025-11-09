/* @kvoip-woulz proprietary */
import { AccountPayableFieldSection } from '@/financial-register/account-payable/types/FieldsSection';

/* @kvoip-woulz proprietary:begin */
export const ACCOUNT_PAYABLE_BASIC_FIELDS = [
  'name',
  'dueDate',
  'status',
] as const;

export const ACCOUNT_PAYABLE_RELATION_FIELDS = [
  'company',
  'integration',
] as const;
/* @kvoip-woulz proprietary:end */

export const ACCOUNT_PAYABLE_FINANCIAL_FIELDS = ['amount'] as const;

export const ACCOUNT_PAYABLE_PAYMENT_INFO_FIELDS = [
  'paymentType',
  'barcode',
  'pixKey',
  'paymentDate',
] as const;

export const ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS = ['message'] as const;

export const ACCOUNT_PAYABLE_SYSTEM_FIELDS = [
  'createdBy',
  'updatedAt',
] as const;

export const ACCOUNT_PAYABLE_FIELD_GROUP_LABELS: Record<
  AccountPayableFieldSection,
  ReadonlyArray<string>
> = {
  [AccountPayableFieldSection.Financial]: ACCOUNT_PAYABLE_FINANCIAL_FIELDS,
  [AccountPayableFieldSection.PaymentInfo]: ACCOUNT_PAYABLE_PAYMENT_INFO_FIELDS,
  [AccountPayableFieldSection.AdditionalInfo]:
    ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS,
  [AccountPayableFieldSection.SystemInfo]: ACCOUNT_PAYABLE_SYSTEM_FIELDS,
  [AccountPayableFieldSection.BasicInfo]: ACCOUNT_PAYABLE_BASIC_FIELDS,
  [AccountPayableFieldSection.Others]: ACCOUNT_PAYABLE_RELATION_FIELDS,
};
