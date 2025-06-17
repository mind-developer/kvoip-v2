import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { NOTA_FISCAL_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const notaFiscalAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'All',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.name],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.charge],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.company],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.product],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.nfType],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.totalAmount],
        position: 5,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.percentNFe],
        position: 6,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.percentNFSe],
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.percentNFCe],
        position: 8,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.percentNFCom],
        position: 9,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.nfStatus],
        position: 10,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.notaFiscal]
            .fields[NOTA_FISCAL_FIELD_IDS.focusNFe],
        position: 11,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
