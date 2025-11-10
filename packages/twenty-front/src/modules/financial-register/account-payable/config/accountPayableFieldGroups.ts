/* @kvoip-woulz proprietary */
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
