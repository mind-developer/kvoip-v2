/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @stylistic/padding-line-between-statements */
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';

const COMPANY_FIELDS: (keyof Pick<
  NotaFiscalWorkspaceEntity,
  'percentNfe' | 'percentNfse' | 'percentNfce' | 'percentNfcom'
>)[] = ['percentNfe', 'percentNfse', 'percentNfce', 'percentNfcom'];

export function fillNotaFiscalFromCompany(
  nota: NotaFiscalWorkspaceEntity,
  company: CompanyWorkspaceEntity,
): NotaFiscalWorkspaceEntity {
  COMPANY_FIELDS.forEach((field) => {
    // @ts-expect-error
    nota[field] = company[field];
  });

  return nota;
}

export function clearNotaFiscalCompanyFields(
  nota: NotaFiscalWorkspaceEntity,
): NotaFiscalWorkspaceEntity {
  COMPANY_FIELDS.forEach((field) => {
    const original = nota[field as keyof NotaFiscalWorkspaceEntity];

    if (typeof original === 'string') {
      (nota as any)[field] = '';
    } else if (typeof original === 'number') {
      (nota as any)[field] = 0;
    } else if (typeof original === 'boolean') {
      (nota as any)[field] = false;
    } else {
      (nota as any)[field] = undefined;
    }
  });

  return nota;
}
