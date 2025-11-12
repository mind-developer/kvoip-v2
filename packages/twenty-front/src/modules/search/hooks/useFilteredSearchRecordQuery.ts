import { formatSearchRecordAsSingleRecordPickerRecord } from '@/object-metadata/utils/formatSearchRecordAsSingleRecordPickerRecord';
/* @kvoip-woulz proprietary:begin */
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
/* @kvoip-woulz proprietary:end */
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { type SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
/* @kvoip-woulz proprietary:begin */
import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
/* @kvoip-woulz proprietary:end */

export const useFilteredSearchRecordQuery = ({
  selectedIds,
  limit,
  excludedRecordIds = [],
  objectNameSingulars,
  searchFilter,
}: {
  selectedIds: string[];
  limit?: number;
  excludedRecordIds?: string[];
  objectNameSingulars: string[];
  searchFilter?: string;
}): {
  selectedRecords: SingleRecordPickerRecord[];
  filteredSelectedRecords: SingleRecordPickerRecord[];
  recordsToSelect: SingleRecordPickerRecord[];
  loading: boolean;
} => {
  /* @kvoip-woulz proprietary:begin */
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItemsByName = useMemo(
    () =>
      mapArrayToObject(objectMetadataItems, ({ nameSingular }) => nameSingular),
    [objectMetadataItems],
  );

  const formatWithMetadata = useCallback(
    (
      searchRecord: Parameters<
        typeof formatSearchRecordAsSingleRecordPickerRecord
      >[0],
    ) => {
      const objectMetadataItem =
        objectMetadataItemsByName[searchRecord.objectNameSingular];

      const labelFieldName = objectMetadataItem?.fields.find(
        ({ id }) => id === objectMetadataItem.labelIdentifierFieldMetadataId,
      )?.name;

      const imageFieldName = objectMetadataItem?.fields.find(
        ({ id }) => id === objectMetadataItem.imageIdentifierFieldMetadataId,
      )?.name;

      return formatSearchRecordAsSingleRecordPickerRecord(searchRecord, {
        labelIdentifierFieldName: labelFieldName,
        imageIdentifierFieldName: imageFieldName,
      });
    },
    [objectMetadataItemsByName],
  );
  /* @kvoip-woulz proprietary:end */

  const selectedIdsFilter = { id: { in: selectedIds } };

  const { loading: selectedRecordsLoading, searchRecords: selectedRecords } =
    useObjectRecordSearchRecords({
      objectNameSingulars,
      filter: selectedIdsFilter,
      skip: !selectedIds.length,
      searchInput: '',
    });

  const {
    loading: filteredSelectedRecordsLoading,
    searchRecords: filteredSelectedRecords,
  } = useObjectRecordSearchRecords({
    objectNameSingulars,
    filter: selectedIdsFilter,
    skip: !selectedIds.length,
    searchInput: searchFilter,
  });

  const notFilterIds = [...selectedIds, ...excludedRecordIds];
  const notFilter = notFilterIds.length
    ? { not: { id: { in: notFilterIds } } }
    : undefined;
  const { loading: recordsToSelectLoading, searchRecords: recordsToSelect } =
    useObjectRecordSearchRecords({
      objectNameSingulars,
      filter: notFilter,
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      searchInput: searchFilter,
      fetchPolicy: 'cache-and-network',
    });

  return {
    /* @kvoip-woulz proprietary:begin */
    selectedRecords: selectedRecords.map(formatWithMetadata),
    filteredSelectedRecords: filteredSelectedRecords.map(formatWithMetadata),
    recordsToSelect: recordsToSelect.map(formatWithMetadata),
    /* @kvoip-woulz proprietary:end */
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
