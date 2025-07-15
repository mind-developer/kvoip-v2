/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @stylistic/padding-line-between-statements */
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import {
  ProductTypeStatus,
  ProductWorkspaceEntity,
} from 'src/modules/product/standard-objects/product.workspace-entity';

const PRODUCT_FIELDS: (keyof Pick<
  NotaFiscalWorkspaceEntity,
  | 'cfop'
  | 'ncm'
  | 'aliquotaIss'
  | 'aliquotaCofins'
  | 'aliquotaPis'
  | 'aliquotaIcms'
  | 'aliquotaIpi'
  | 'itemListaServico'
  | 'issRetido'
  | 'origem'
  | 'unitOfMeasure'
  | 'cstIcmsCsosn'
  | 'totalAmount'
>)[] = [
  'cfop',
  'ncm',
  'aliquotaIss',
  'aliquotaCofins',
  'aliquotaPis',
  'aliquotaIcms',
  'aliquotaIpi',
  'itemListaServico',
  'issRetido',
  'origem',
  'unitOfMeasure',
  'cstIcmsCsosn',
  'totalAmount',
];

const mapProductTypeToNfType: Record<ProductTypeStatus, NfType> = {
  [ProductTypeStatus.COMMODITY]: NfType.NFCOM,
  [ProductTypeStatus.SERVICE]: NfType.NFSE,
};

export function fillNotaFiscalFromProduct(
  nota: NotaFiscalWorkspaceEntity,
  product: ProductWorkspaceEntity,
): NotaFiscalWorkspaceEntity {
  PRODUCT_FIELDS.forEach((field) => {
    // @ts-expect-error
    nota[field] = product[field];
  });

  nota.nfType =
    mapProductTypeToNfType[product.productType as ProductTypeStatus];

  return nota;
}

export function clearNotaFiscalProductFields(
  nota: NotaFiscalWorkspaceEntity,
): NotaFiscalWorkspaceEntity {
  PRODUCT_FIELDS.forEach((field) => {
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

  nota.nfType = 'none';

  return nota;
}
