/* @kvoip-woulz proprietary */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  RecordCreateContext,
  type PersistFieldValueParams,
} from '@/object-record/record-create/contexts/RecordCreateContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

type RecordCreateProviderProps = {
  children: ReactNode;
  objectMetadataItem: ObjectMetadataItem;
  initialValues?: Record<string, unknown>;
  draftRecordId?: string;
};

export const RecordCreateProvider = ({
  children,
  objectMetadataItem,
  initialValues = {},
  draftRecordId: draftRecordIdFromProps,
}: RecordCreateProviderProps) => {
  const [draftValues, setDraftValues] =
    useState<Record<string, unknown>>(initialValues);

  const draftRecordId = useMemo(
    () => draftRecordIdFromProps ?? `draft-${v4()}`,
    [draftRecordIdFromProps],
  );
  const trackedFieldNames = useMemo(() => new Set<string>(), []);

  const setDraftFieldValue = useRecoilCallback(
    ({ set }) =>
      (fieldName: string, value: unknown) => {
        trackedFieldNames.add(fieldName);
        set(
          recordStoreFamilySelector({
            recordId: draftRecordId,
            fieldName,
          }),
          value,
        );
      },
    [draftRecordId, trackedFieldNames],
  );

  const resetDraftFieldValue = useRecoilCallback(
    ({ reset }) =>
      (fieldName: string) => {
        reset(
          recordStoreFamilySelector({
            recordId: draftRecordId,
            fieldName,
          }),
        );
      },
    [draftRecordId],
  );

  useEffect(() => {
    Object.entries(initialValues).forEach(([fieldName, value]) => {
      setDraftFieldValue(fieldName, value);
    });
  }, [initialValues, setDraftFieldValue]);

  const persistFieldValue = useCallback(
    ({ fieldDefinition, value }: PersistFieldValueParams) => {
      const fieldName = fieldDefinition.metadata.fieldName;

      if (!fieldName) {
        return;
      }

      setDraftValues((previousValues) => ({
        ...previousValues,
        [fieldName]: value,
      }));

      setDraftFieldValue(fieldName, value);
    },
    [setDraftFieldValue],
  );

  const resetDraft = useCallback(() => {
    trackedFieldNames.forEach((fieldName) => {
      resetDraftFieldValue(fieldName);
    });
    trackedFieldNames.clear();
    setDraftValues({});
  }, [resetDraftFieldValue, trackedFieldNames]);

  useEffect(() => {
    return () => {
      trackedFieldNames.forEach((fieldName) => {
        resetDraftFieldValue(fieldName);
      });
      trackedFieldNames.clear();
    };
  }, [resetDraftFieldValue, trackedFieldNames]);

  const contextValue = useMemo(
    () => ({
      draftRecordId,
      objectMetadataItem,
      draftValues,
      persistFieldValue,
      resetDraft,
    }),
    [
      draftRecordId,
      draftValues,
      objectMetadataItem,
      persistFieldValue,
      resetDraft,
    ],
  );

  return (
    <RecordCreateContext.Provider value={contextValue}>
      {children}
    </RecordCreateContext.Provider>
  );
};
