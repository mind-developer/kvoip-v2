/* @kvoip-woulz proprietary */
import { createContext } from 'react';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

export type PersistFieldValueParams = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  value: unknown;
};

export type RecordCreateContextValue = {
  draftRecordId: string;
  objectMetadataItem: ObjectMetadataItem;
  draftValues: Record<string, unknown>;
  persistFieldValue: (params: PersistFieldValueParams) => void;
  resetDraft: () => void;
};

export const RecordCreateContext =
  createContext<RecordCreateContextValue | null>(null);
