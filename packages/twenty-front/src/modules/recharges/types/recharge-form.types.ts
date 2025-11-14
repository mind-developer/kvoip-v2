/* @kvoip-woulz proprietary */
export type DocumentType = 'CPF' | 'CNPJ';

export type RechargeFormData = {
  documentType: DocumentType;
  document: string;
  company: string;
  amount: string;
  paymentMethod: string;
};

