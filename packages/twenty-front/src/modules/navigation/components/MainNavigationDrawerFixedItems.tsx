import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';

import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { ChatNavigationNavItem } from '@/navigation/components/ChatNavigationNavItem';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  IconChartBar,
  IconLink,
  IconSearch,
  IconSettings,
  IconSparkles,
} from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';


export const MainNavigationDrawerFixedItems = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilState(
    navigationDrawerExpandedMemorizedState,
  );

  const navigate = useNavigate();

  const { t } = useLingui();
  const { workspaceFavoritesObjectMetadataItems } = useWorkspaceFavorites();
  const lastVisitedViewPerObjectMetadataItem =
    useRecoilValue(lastVisitedViewPerObjectMetadataItemState) ?? {};

  const getNavigationPath = (objectName: string) => {
    const objectMetadata = workspaceFavoritesObjectMetadataItems?.find(
      (item: any) => item.nameSingular === objectName,
    );

    const viewId = objectMetadata?.id;
    const lastVisitedViewId = viewId
      ? lastVisitedViewPerObjectMetadataItem[viewId]
      : undefined;

    return getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadata?.namePlural ?? '' },
      lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
    );
  };

  /* @kvoip-woulz proprietary:begin */
  const traceablePath = getNavigationPath('traceable');
  /* @kvoip-woulz proprietary:end */

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  return (
    !isMobile && (
      <>
        <NavigationDrawerItem
          label={t`Search`}
          Icon={IconSearch}
          onClick={openRecordsSearchPage}
          keyboard={['/']}
          mouseUpNavigation={true}
        />
        {isAiEnabled && (
          <NavigationDrawerItem
            label={t`Ask AI`}
            Icon={IconSparkles}
            onClick={() => openAskAIPage()}
            keyboard={['@']}
            mouseUpNavigation={true}
          />
        )}
        <NavigationDrawerItem
          label={t`Settings`}
          to={getSettingsPath(SettingsPath.ProfilePage)}
          onClick={() => {
            setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
            setIsNavigationDrawerExpanded(true);
            setNavigationMemorizedUrl(location.pathname + location.search);
            navigate(getSettingsPath(SettingsPath.ProfilePage));
          }}
          Icon={IconSettings}
        />

        {/* @kvoip-woulz proprietary:begin */}
        <ChatNavigationNavItem />
        <NavigationDrawerItem
          label="Dashboard links"
          to={'/dashboard-links'}
          Icon={IconChartBar}
        />
        <NavigationDrawerItem
          label="Traceable link"
          to={traceablePath}
          // eslint-disable-next-line @nx/workspace-no-navigate-prefer-link
          onClick={() => {
            navigate(traceablePath);
          }}
          Icon={IconLink}
        />
        {/* @kvoip-woulz proprietary:end */}
      </>
    )
  );
};
