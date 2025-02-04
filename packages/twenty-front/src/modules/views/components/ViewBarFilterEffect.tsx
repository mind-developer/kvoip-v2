import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownSelectedOptionValuesComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedOptionValuesComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { onFilterSelectComponentState } from '@/object-record/object-filter-dropdown/states/onFilterSelectComponentState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { jsonRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { simpleRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/simpleRelationFilterValueSchema';
import { isDefined } from 'twenty-shared';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
}: ViewBarFilterEffectProps) => {
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const setOnFilterSelect = useSetRecoilComponentStateV2(
    onFilterSelectComponentState,
    filterDropdownId,
  );

  const filterDefinitionUsedInDropdown = useRecoilComponentValueV2(
    filterDefinitionUsedInDropdownComponentState,
    filterDropdownId,
  );

  const setObjectFilterDropdownSelectedRecordIds = useSetRecoilComponentStateV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
    filterDropdownId,
  );

  const setObjectFilterDropdownSelectedOptionValues =
    useSetRecoilComponentStateV2(
      objectFilterDropdownSelectedOptionValuesComponentState,
      filterDropdownId,
    );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  useEffect(() => {
    if (isDefined(availableFilterDefinitions)) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }
    setOnFilterSelect(() => (filter: RecordFilter | null) => {
      if (isDefined(filter)) {
        upsertCombinedViewFilter(filter);
      }
    });
  }, [
    availableFilterDefinitions,
    setAvailableFilterDefinitions,
    setOnFilterSelect,
    upsertCombinedViewFilter,
  ]);

  useEffect(() => {
    if (filterDefinitionUsedInDropdown?.type === 'RELATION') {
      const viewFilterUsedInDropdown =
        currentViewWithCombinedFiltersAndSorts?.viewFilters.find(
          (filter) =>
            filter.fieldMetadataId ===
            filterDefinitionUsedInDropdown?.fieldMetadataId,
        );

      const { selectedRecordIds } = jsonRelationFilterValueSchema
        .catch({
          isCurrentWorkspaceMemberSelected: false,
          selectedRecordIds: simpleRelationFilterValueSchema.parse(
            recordFilterUsedInDropdown?.value,
          ),
        })
        .parse(recordFilterUsedInDropdown?.value);

      setObjectFilterDropdownSelectedRecordIds(selectedRecordIds);
    } else if (
      isDefined(fieldMetadataItemUsedInDropdown) &&
      ['SELECT', 'MULTI_SELECT'].includes(fieldMetadataItemUsedInDropdown.type)
    ) {
      const recordFilterUsedInDropdown = currentRecordFilters.find(
        (filter) =>
          filter.fieldMetadataId === fieldMetadataItemUsedInDropdown?.id,
      );

      const recordFilterSelectedRecords = isNonEmptyString(
        recordFilterUsedInDropdown?.value,
      )
        ? JSON.parse(recordFilterUsedInDropdown.value)
        : [];
      setObjectFilterDropdownSelectedOptionValues(recordFilterSelectedRecords);
    }
  }, [
    fieldMetadataItemUsedInDropdown,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
    currentRecordFilters,
  ]);

  return <></>;
};
