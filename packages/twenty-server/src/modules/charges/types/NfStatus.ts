import { registerEnumType } from '@nestjs/graphql';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum NfStatus {
  CANCELLED = 'cancelled',
  ISSUED = 'issued',
  ISSUE = 'issue',
  DRAFT = 'draft',
  CANCEL = 'cancel',
}

export const NfStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: NfStatus.CANCELLED,
    label: 'Cancelada',
    position: 0,
    color: 'red',
  },
  {
    value: NfStatus.ISSUED,
    label: 'Emitida',
    position: 1,
    color: 'green',
  },
  {
    value: NfStatus.ISSUE,
    label: 'Emitir',
    position: 2,
    color: 'orange',
  },
  {
    value: NfStatus.DRAFT,
    label: 'Rascunho',
    position: 3,
    color: 'yellow',
  },
  {
    value: NfStatus.CANCEL,
    label: 'Cancelar',
    position: 4,
    color: 'purple',
  },
];

registerEnumType(NfStatus, {
  name: 'NfStatus',
  description: 'NF status options',
});
