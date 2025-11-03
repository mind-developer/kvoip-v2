/* @kvoip-woulz proprietary */
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FINANCIAL_REGISTER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const financialRegistersReceivablesView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const financialRegisterObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.financialRegister,
  );

  return {
    name: 'A Receber',
    objectMetadataId: financialRegisterObjectMetadata?.id ?? '',
    type: 'table',
    key: 'RECEIVABLES',
    position: 0,
    icon: 'IconCurrencyDollar',
    kanbanFieldMetadataId: '',
    filters: [
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId ===
              FINANCIAL_REGISTER_STANDARD_FIELD_IDS.registerType,
          )?.id ?? '',
        value: 'receivable',
        operand: 'is',
        displayValue: 'A Receber',
      },
    ],
    fields: [
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId ===
              FINANCIAL_REGISTER_STANDARD_FIELD_IDS.documentNumber,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId ===
              FINANCIAL_REGISTER_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId === FINANCIAL_REGISTER_STANDARD_FIELD_IDS.amount,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId ===
              FINANCIAL_REGISTER_STANDARD_FIELD_IDS.dueDate,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId === FINANCIAL_REGISTER_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
    ],
  };
};

export const financialRegistersPayablesView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const financialRegisterObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.financialRegister,
  );

  return {
    name: 'A Pagar',
    objectMetadataId: financialRegisterObjectMetadata?.id ?? '',
    type: 'table',
    key: 'PAYABLES',
    position: 1,
    icon: 'IconReceipt',
    kanbanFieldMetadataId: '',
    filters: [
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId ===
              FINANCIAL_REGISTER_STANDARD_FIELD_IDS.registerType,
          )?.id ?? '',
        value: 'payable',
        operand: 'is',
        displayValue: 'A Pagar',
      },
    ],
    fields: [
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId ===
              FINANCIAL_REGISTER_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId === FINANCIAL_REGISTER_STANDARD_FIELD_IDS.amount,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId ===
              FINANCIAL_REGISTER_STANDARD_FIELD_IDS.dueDate,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId === FINANCIAL_REGISTER_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          financialRegisterObjectMetadata?.fields.find(
            (field) =>
              field.standardId ===
              FINANCIAL_REGISTER_STANDARD_FIELD_IDS.barcode,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 250,
      },
    ],
  };
};
