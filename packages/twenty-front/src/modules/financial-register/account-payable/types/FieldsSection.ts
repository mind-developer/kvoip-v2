/* @kvoip-woulz proprietary */
export enum AccountPayableFieldSection {
  BasicInfo = 'BasicInfo',
  Financial = 'Financial',
  PaymentInfo = 'PaymentInfo',
  AdditionalInfo = 'AdditionalInfo',
  SystemInfo = 'SystemInfo',
  Others = 'Others',
}

export const getAccountPayableFieldSectionLabel = (
  section: AccountPayableFieldSection,
) =>
  ({
    [AccountPayableFieldSection.BasicInfo]: 'no-label-basic-info',
    [AccountPayableFieldSection.Financial]: 'Financial',
    [AccountPayableFieldSection.PaymentInfo]: 'Payment Information',
    [AccountPayableFieldSection.AdditionalInfo]: 'Additional Information',
    [AccountPayableFieldSection.SystemInfo]: 'System Information',
    /* @kvoip-woulz proprietary:begin */
    [AccountPayableFieldSection.Others]: 'Related Records',
    /* @kvoip-woulz proprietary:end */
  })[section];
