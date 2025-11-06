/* @kvoip-woulz proprietary */
export enum AccountReceivableFieldSection {
  BasicInfo = 'BasicInfo',
  Financial = 'Financial',
  PaymentInfo = 'PaymentInfo',
  Others = 'Others',
}

export const getAccountReceivableFieldSectionLabel = (
  section: AccountReceivableFieldSection,
) =>
  ({
    [AccountReceivableFieldSection.BasicInfo]: 'no-label-basic-info',
    [AccountReceivableFieldSection.Financial]: 'Financial',
    [AccountReceivableFieldSection.PaymentInfo]: 'Payment Information',
    [AccountReceivableFieldSection.Others]: 'no-label-others',
  })[section];
