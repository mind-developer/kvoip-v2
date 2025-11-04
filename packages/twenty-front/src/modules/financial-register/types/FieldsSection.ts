/* @kvoip-woulz proprietary */
export enum FinancialRegisterFieldSection {
  BasicInfo = 'BasicInfo',
  ReceivableSpecific = 'ReceivableSpecific',
  PayableSpecific = 'PayableSpecific',
  Others = 'Others',
}

export const getFinancialRegisterFieldSectionLabel = (
  section: FinancialRegisterFieldSection,
): string => {
  switch (section) {
    case FinancialRegisterFieldSection.BasicInfo:
      return 'Informações Básicas';
    case FinancialRegisterFieldSection.ReceivableSpecific:
      return 'A Receber';
    case FinancialRegisterFieldSection.PayableSpecific:
      return 'A Pagar';
    case FinancialRegisterFieldSection.Others:
      return 'no-label-others';
    default:
      return '';
  }
};
