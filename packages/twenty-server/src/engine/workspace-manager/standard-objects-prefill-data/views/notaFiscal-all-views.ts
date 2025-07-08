import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { NOTA_FISCAL_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const notaFiscalAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const notaFiscalObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.notaFiscal,
  );

  if (!notaFiscalObjectMetadata) {
    throw new Error('Nota Fiscal object metadata not found');
  }

  return {
    name: 'All',
    objectMetadataId: notaFiscalObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.charge,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.company,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.product,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.nfType,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.totalAmount,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.percentNFSe,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 80,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.percentNFCom,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 80,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.nfStatus,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          notaFiscalObjectMetadata.fields.find(
            (field) => field.standardId === NOTA_FISCAL_FIELD_IDS.focusNFe,
          )?.id ?? '',
        position: 9,
        isVisible: true,
        size: 100,
      },
    ],
  };
};
