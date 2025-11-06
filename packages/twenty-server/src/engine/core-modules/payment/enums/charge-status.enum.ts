// TODO: Should we create a charge status enum in the ChargeWorkspaceEntity?
// This would be managed for generating logs and notifications.
export enum ChargeStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}
