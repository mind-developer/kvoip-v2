/* @kvoip-woulz proprietary */
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ACCOUNT_PAYABLE_STANDARD_FIELD_IDS,
  ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const accountsReceivableAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const accountReceivableObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.accountReceivable,
  );

  if (!accountReceivableObjectMetadata) {
    throw new Error('Account Receivable object metadata not found');
  }

  return {
    name: 'All Accounts Receivable',
    objectMetadataId: accountReceivableObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          accountReceivableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          accountReceivableObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          accountReceivableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.amount,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          accountReceivableObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.dueDate,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          accountReceivableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_RECEIVABLE_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
    ],
  };
};

export const accountsPayableAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const accountPayableObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.accountPayable,
  );

  if (!accountPayableObjectMetadata) {
    throw new Error('Account Payable object metadata not found');
  }

  return {
    name: 'All Accounts Payable',
    objectMetadataId: accountPayableObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          accountPayableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          accountPayableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          accountPayableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.amount,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          accountPayableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.dueDate,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          accountPayableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          accountPayableObjectMetadata.fields.find(
            (field) =>
              field.standardId === ACCOUNT_PAYABLE_STANDARD_FIELD_IDS.barcode,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 250,
      },
    ],
  };
};
