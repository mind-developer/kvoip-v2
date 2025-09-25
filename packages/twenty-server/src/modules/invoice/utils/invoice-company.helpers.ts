/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @stylistic/padding-line-between-statements */
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';

const COMPANY_FIELDS: (keyof Pick<
  InvoiceWorkspaceEntity,
  'percentNfe' | 'percentNfse' | 'percentNfce' | 'percentNfcom'
>)[] = ['percentNfe', 'percentNfse', 'percentNfce', 'percentNfcom'];

export function fillInvoiceFromCompany(
  invoice: InvoiceWorkspaceEntity,
  company: CompanyWorkspaceEntity,
): InvoiceWorkspaceEntity {
  COMPANY_FIELDS.forEach((field) => {
    // @ts-expect-error
    invoice[field] = company[field];
  });

  return invoice;
}

export function clearInvoiceCompanyFields(
  invoice: InvoiceWorkspaceEntity,
): InvoiceWorkspaceEntity {
  COMPANY_FIELDS.forEach((field) => {
    const original = invoice[field as keyof InvoiceWorkspaceEntity];

    if (typeof original === 'string') {
      (invoice as any)[field] = '';
    } else if (typeof original === 'number') {
      (invoice as any)[field] = 0;
    } else if (typeof original === 'boolean') {
      (invoice as any)[field] = false;
    } else {
      (invoice as any)[field] = undefined;
    }
  });

  return invoice;
}
