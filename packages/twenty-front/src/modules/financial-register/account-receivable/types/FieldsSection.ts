/* @kvoip-woulz proprietary */
export enum AccountReceivableFieldSection {
  BasicInfo = 'BasicInfo',
  Financial = 'Financial',
  Others = 'Others',
}

export const getAccountReceivableFieldSectionLabel = (
  section: AccountReceivableFieldSection,
) =>
  ({
    [AccountReceivableFieldSection.BasicInfo]: 'no-label-basic-info',
    [AccountReceivableFieldSection.Financial]: 'Financial',
    [AccountReceivableFieldSection.Others]: 'no-label-others',
  })[section];
