/* @kvoip-woulz proprietary */
/* @kvoip-woulz proprietary:begin */
export const ACCOUNT_PAYABLE_PRIMARY_FIELDS = [
  'name',
  'dueDate',
  'status',
  'amount',
  'paymentType',
  'barcode',
  'pixKey',
  'paymentDate',
  'message',
] as const;

export const ACCOUNT_PAYABLE_RELATION_FIELDS = [
  'company',
  'integration',
] as const;

/**
 * Central list of fields that must be populated before a draft can be saved.
 * Extend or trim this array to adjust required fields for the account payable form.
 */
export const ACCOUNT_PAYABLE_REQUIRED_FIELDS = [
  'name',
  'dueDate',
  'status',
  'amount',
  'company',
] as const;

export const ACCOUNT_PAYABLE_EXCLUDED_SYSTEM_FIELDS = [
  'createdAt',
  'deletedAt',
  'createdBy',
  'updatedAt',
] as const;
/* @kvoip-woulz proprietary:end */
