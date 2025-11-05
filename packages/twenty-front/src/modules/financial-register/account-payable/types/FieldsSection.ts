/* @kvoip-woulz proprietary */
export enum AccountPayableFieldSection {
  BasicInfo = 'BasicInfo',
  Financial = 'Financial',
  PaymentInfo = 'PaymentInfo',
  Others = 'Others',
}

export const getAccountPayableFieldSectionLabel = (
  section: AccountPayableFieldSection,
) =>
  ({
    [AccountPayableFieldSection.BasicInfo]: 'no-label-basic-info',
    [AccountPayableFieldSection.Financial]: 'Financial',
    [AccountPayableFieldSection.PaymentInfo]: 'Payment Information',
    [AccountPayableFieldSection.Others]: 'no-label-others',
  })[section];
