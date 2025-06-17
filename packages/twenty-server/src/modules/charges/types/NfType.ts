import { registerEnumType } from '@nestjs/graphql';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum NfType {
  NFE = 'nfe',
  NFSE = 'nfse',
  NFCOM = 'nfcom',
  NFCE = 'nfce',
}

export const NfTypeOptions: FieldMetadataComplexOption[] = [
  {
    value: 'none',
    label: 'None',
    position: 0,
    color: 'gray',
  },
  {
    value: NfType.NFE,
    label: 'NF-e',
    position: 1,
    color: 'green',
  },
  {
    value: NfType.NFSE,
    label: 'NFS-e',
    position: 2,
    color: 'green',
  },
  {
    value: NfType.NFCOM,
    label: 'NF-Com',
    position: 3,
    color: 'green',
  },
  {
    value: NfType.NFCE,
    label: 'NFC-e',
    position: 4,
    color: 'green',
  },
];

registerEnumType(NfType, {
  name: 'NfType',
  description: 'Product NF type options',
});
