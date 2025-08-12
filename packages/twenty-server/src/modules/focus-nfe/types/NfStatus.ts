import { registerEnumType } from '@nestjs/graphql';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum NfStatus {
  CANCELLED = 'cancelled',
  ISSUED = 'issued',
  ISSUE = 'issue',
  DRAFT = 'draft',
  CANCEL = 'cancel',
  IN_PROCESS = 'in_process',
}

export const NfStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: NfStatus.DRAFT,
    label: 'Rascunho',
    position: 0,
    color: 'yellow',
  },
  {
    value: NfStatus.ISSUE,
    label: 'Emitir',
    position: 1,
    color: 'orange',
  },
  {
    value: NfStatus.ISSUED,
    label: 'Emitida',
    position: 2,
    color: 'green',
  },
  {
    value: NfStatus.CANCEL,
    label: 'Cancelar',
    position: 3,
    color: 'purple',
  },
  {
    value: NfStatus.CANCELLED,
    label: 'Cancelada',
    position: 4,
    color: 'red',
  },
  {
    value: NfStatus.IN_PROCESS,
    label: 'Em processo',
    position: 5,
    color: 'gray',
  },
];

registerEnumType(NfStatus, {
  name: 'NfStatus',
  description: 'NF status options',
});
