import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const ViewBarRecordFilterEffect = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const currentView = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const [
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
  ] = useRecoilComponentFamilyStateV2(
    hasInitializedCurrentRecordFiltersComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
    currentRecordFiltersComponentState,
  );

  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    contextStoreCurrentObjectMetadataItemId ?? '',
  );

  useEffect(() => {
    if (isDefined(currentView) && !hasInitializedCurrentRecordFilters) {
      if (
        currentView.objectMetadataId !== contextStoreCurrentObjectMetadataItemId
      ) {
        return;
      }

      if (isDefined(currentView)) {
        setCurrentRecordFilters(
          mapViewFiltersToFilters(
            currentView.viewFilters,
            filterableFieldMetadataItems,
          ),
        );

        setHasInitializedCurrentRecordFilters(true);
      }
    }
  }, [
    currentViewId,
    setCurrentRecordFilters,
    filterableFieldMetadataItems,
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
    currentView,
    contextStoreCurrentObjectMetadataItemId,
  ]);

  return null;
};
