import { useEffect } from 'react';

import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';

export const QueryParamsFiltersEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams } =
    useViewFromQueryParams();

  const currentViewId = useRecoilComponentValueV2(currentViewIdComponentState);

  const setUnsavedViewFilter = useSetRecoilComponentFamilyStateV2(
    unsavedToUpsertViewFiltersComponentFamilyState,
    { viewId: viewIdQueryParam ?? currentViewId },
  );

  const { resetUnsavedViewStates } = useResetUnsavedViewStates();

  useEffect(() => {
    if (!hasFiltersQueryParams) {
      return;
    }

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        setUnsavedViewFilter(filtersFromParams);
      }
    });
  }, [
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
  ]);

  return <></>;
};
