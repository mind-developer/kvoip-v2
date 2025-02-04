import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { tableFiltersComponentState } from '@/object-record/record-table/states/tableFiltersComponentState';
import { tableSortsComponentState } from '@/object-record/record-table/states/tableSortsComponentState';
import { tableViewFilterGroupsComponentState } from '@/object-record/record-table/states/tableViewFilterGroupsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useFindManyRecordIndexTableParams = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { recordGroupFilter } = useRecordGroupFilter(
    objectMetadataItem?.fields,
  );

  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );
  const tableFilters = useRecoilComponentValueV2(
    tableFiltersComponentState,
    recordTableId,
  );
  const tableSorts = useRecoilComponentValueV2(
    tableSortsComponentState,
    recordTableId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const stateFilter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem?.fields ?? [],
    filterValueDependencies,
    tableFilters,
    objectMetadataItem?.fields ?? [],
    tableViewFilterGroups,
  );

  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, currentRecordSorts);

  return {
    objectNameSingular,
    filter: {
      ...stateFilter,
      ...recordGroupFilter,
    },
    orderBy,
    // If we have a current record group definition, we only want to fetch 8 records by page
    ...(currentRecordGroupDefinition ? { limit: 8 } : {}),
  };
};
