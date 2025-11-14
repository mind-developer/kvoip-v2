import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
/* @kvoip-woulz proprietary:begin */
import { RecordCreateContext } from '@/object-record/record-create/contexts/RecordCreateContext';
/* @kvoip-woulz proprietary:end */
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/ui/hooks/usePersistField';
import { useContext } from 'react';

export const usePersistFieldFromFieldInputContext = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
  /* @kvoip-woulz proprietary:begin */
  const recordCreateContext = useContext(RecordCreateContext);
  /* @kvoip-woulz proprietary:end */

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.fields.some(
        (fieldMetadataItemToFind) =>
          fieldMetadataItemToFind.id === fieldDefinition.fieldMetadataId,
      ),
  );

  const persistField = usePersistField({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
  });

  const persistFieldFromFieldInputContext = (valueToPersist: unknown) => {
    /* @kvoip-woulz proprietary:begin */
    if (recordCreateContext !== null) {
      recordCreateContext.persistFieldValue({
        fieldDefinition,
        value: valueToPersist,
      });

      return;
    }
    /* @kvoip-woulz proprietary:end */

    persistField({
      recordId,
      fieldDefinition,
      valueToPersist,
    });
  };

  return { persistFieldFromFieldInputContext };
};
