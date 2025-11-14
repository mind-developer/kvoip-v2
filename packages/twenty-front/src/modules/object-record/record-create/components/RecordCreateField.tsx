/* @kvoip-woulz proprietary */
import { useMemo } from 'react';

import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { useRecordCreateContext } from '@/object-record/record-create/hooks/useRecordCreateContext';
import {
  FieldContext,
  type GenericFieldContextType,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { type ObjectPermissions } from 'twenty-shared/types';
import { type ObjectPermission } from '~/generated/graphql';

type RecordCreateFieldProps = {
  fieldName: string;
  position: number;
  labelWidth?: number;
  showLabel?: boolean;
  onMouseEnter?: (index: number) => void;
  instanceIdPrefix: string;
  isFieldLabelIdentifier?: boolean;
  objectPermissions: ObjectPermissions;
};

export const RecordCreateField = ({
  fieldName,
  position,
  showLabel = true,
  labelWidth = 90,
  onMouseEnter,
  instanceIdPrefix,
  isFieldLabelIdentifier = false,
  objectPermissions,
}: RecordCreateFieldProps) => {
  const { draftRecordId, objectMetadataItem, persistFieldValue } =
    useRecordCreateContext();

  const fieldMetadataItem = useMemo(
    () =>
      objectMetadataItem.fields.find((field) => field.name === fieldName) ??
      null,
    [fieldName, objectMetadataItem],
  );

  const fieldDefinition = useMemo(() => {
    if (!fieldMetadataItem) {
      return null;
    }

    return formatFieldMetadataItemAsColumnDefinition({
      field: fieldMetadataItem,
      position,
      objectMetadataItem,
      showLabel,
      labelWidth,
    });
  }, [fieldMetadataItem, labelWidth, objectMetadataItem, position, showLabel]);

  if (!fieldMetadataItem || fieldDefinition === null) {
    return null;
  }

  const objectPermission: ObjectPermission = useMemo(
    () => ({
      objectMetadataId: objectMetadataItem.id,
      canDestroyObjectRecords: objectPermissions.canDestroyObjectRecords,
      canReadObjectRecords: objectPermissions.canReadObjectRecords,
      canSoftDeleteObjectRecords: objectPermissions.canSoftDeleteObjectRecords,
      canUpdateObjectRecords: objectPermissions.canUpdateObjectRecords,
      restrictedFields:
        (objectPermissions as { restrictedFields?: unknown })
          .restrictedFields ?? {},
    }),
    [objectMetadataItem.id, objectPermissions],
  );

  const fieldContextValue: GenericFieldContextType = {
    recordId: draftRecordId,
    isLabelIdentifier: isFieldLabelIdentifier,
    fieldDefinition,
    isDisplayModeFixHeight: true,
    isRecordFieldReadOnly: isRecordFieldReadOnly({
      isRecordReadOnly: false,
      objectPermissions: objectPermission,
      fieldMetadataItem: {
        id: fieldMetadataItem.id,
        isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
      },
    }),
    onMouseEnter: onMouseEnter ? () => onMouseEnter(position) : undefined,
    anchorId: getRecordFieldInputInstanceId({
      recordId: draftRecordId,
      fieldName: fieldMetadataItem.name,
      prefix: instanceIdPrefix,
    }),
    useUpdateRecord: () => [
      ({ variables }) => {
        const updateEntries = Object.entries(variables.updateOneRecordInput);

        const [, value] = updateEntries[0] ?? [];

        persistFieldValue({
          fieldDefinition,
          value,
        });
      },
      {},
    ],
  };

  return (
    <FieldContext.Provider value={fieldContextValue}>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: getRecordFieldInputInstanceId({
            recordId: draftRecordId,
            fieldName: fieldMetadataItem.name,
            prefix: instanceIdPrefix,
          }),
        }}
      >
        <RecordInlineCell instanceIdPrefix={instanceIdPrefix} />
      </RecordFieldComponentInstanceContext.Provider>
    </FieldContext.Provider>
  );
};
