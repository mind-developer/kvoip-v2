/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @stylistic/padding-line-between-statements */
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';
import {
    ProductTypeStatus,
    ProductWorkspaceEntity,
} from 'src/modules/product/standard-objects/product.workspace-entity';

const PRODUCT_FIELDS: (keyof Pick<
  InvoiceWorkspaceEntity,
  | 'cfop'
  | 'ncm'
  | 'rateIss'
  | 'rateCofins'
  | 'ratePis'
  | 'rateIcms'
  | 'rateIpi'
  | 'serviceListItem'
  | 'issRetained'
  | 'origin'
  | 'unitOfMeasure'
  | 'cstIcmsCsosn'
  | 'totalAmount'
  | 'classification'
  | 'unit'
>)[] = [
  'cfop',
  'ncm',
  'rateIss',
  'rateCofins',
  'ratePis',
  'rateIcms',
  'rateIpi',
  'serviceListItem',
  'issRetained',
  'origin',
  'unitOfMeasure',
  'cstIcmsCsosn',
  'totalAmount',
  'classification',
  'unit',
];

const mapProductTypeToNfType: Record<ProductTypeStatus, NfType> = {
  [ProductTypeStatus.COMMODITY]: NfType.NFCOM,
  [ProductTypeStatus.SERVICE]: NfType.NFSE,
};

export function fillInvoiceFromProduct(
  invoice: InvoiceWorkspaceEntity,
  product: ProductWorkspaceEntity,
): InvoiceWorkspaceEntity {
  PRODUCT_FIELDS.forEach((field) => {
    // @ts-expect-error
    invoice[field] = product[field];
  });

  invoice.nfType =
    mapProductTypeToNfType[product.productType as ProductTypeStatus];

  return invoice;
}

export function clearInvoiceProductFields(
  invoice: InvoiceWorkspaceEntity,
): InvoiceWorkspaceEntity {
  PRODUCT_FIELDS.forEach((field) => {
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

  invoice.nfType = 'none';

  return invoice;
}
