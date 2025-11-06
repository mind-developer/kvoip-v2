/* @kvoip-woulz proprietary */
/**
 * Defines what capabilities a payment provider supports
 * This allows checking support before attempting operations
 *
 * Note: This is a simplified version of the capabilities.
 * We need to add more capabilities as we implement the payment provider.
 *
 * We also need here to add the capabilities of the payment provider suported by the
 * official payment provider documentation regadless if we will implement it or not.
 */
export type PaymentProviderCapabilities = {
  // Payment methods
  boleto: boolean;
  bolepix: boolean; // Boleto + PIX combo
  pix: boolean;
  creditCard: boolean;
  debitCard: boolean;
  bankTransfer: boolean;

  // Operations
  refunds: boolean;
  partialRefunds: boolean;
  cancellation: boolean;
  updates: boolean; // Can update charge amount/date
  statusQuery: boolean; // Can query charge status directly
  listCharges: boolean; // Can list all charges

  // Features
  installments: boolean; // Card installments (parcelamento)
  recurring: boolean; // Recurring payments
  webhooks: boolean; // Webhook support for status updates
};
