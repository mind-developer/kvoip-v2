import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { IconLink, IconRobot, IconSearch, IconSettings } from 'twenty-ui';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CurrentWorkspaceMemberFavoritesFolders } from '@/favorites/components/CurrentWorkspaceMemberFavoritesFolders';
import { WorkspaceFavorites } from '@/favorites/components/WorkspaceFavorites';
import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { ChatNavigationNavItem } from '@/navigation/components/ChatNavigationNavItem';
import { NavigationDrawerOpenedSection } from '@/object-metadata/components/NavigationDrawerOpenedSection';
import { RemoteNavigationDrawerSection } from '@/object-metadata/components/RemoteNavigationDrawerSection';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useGetUserSoftfone } from '@/settings/service-center/telephony/hooks/useGetUserSoftfone';
import { SettingsPath } from '@/types/SettingsPath';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import InnerHTML from 'dangerously-set-html-content';
import { useMemo } from 'react';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledMainSection = styled(NavigationDrawerSection)`
  min-height: fit-content;
`;
const StyledInnerContainer = styled.div`
  height: 100%;
`;

export const MainNavigationDrawerItems = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );
  const { workspaceFavoritesObjectMetadataItems } = useWorkspaceFavorites();

  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilState(
    navigationDrawerExpandedMemorizedState,
  );

  const { t } = useLingui();

  const { openRecordsSearchPage } = useCommandMenu();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const workspaceMember = workspaceMembers.find(
    (member) => member.id === currentWorkspaceMember?.id,
  );

  const { telephonyExtension, loading: loadingSoftfone } = useGetUserSoftfone({
    extNum: workspaceMember?.extensionNumber || '',
  });

  const traceableObject = useMemo(() => {
    return workspaceFavoritesObjectMetadataItems?.find(
      (item) => item.nameSingular === 'charge',
    );
  }, [workspaceFavoritesObjectMetadataItems]);

  const viewId = traceableObject?.id;

  return (
    <>
      {!loadingSoftfone && telephonyExtension && (
        <InnerHTML
          allowRerender
          html={telephonyExtension.codigo_incorporacao}
        />
      )}
      {!isMobile && (
        <StyledMainSection>
          <NavigationDrawerItem
            label={t`Search`}
            Icon={IconSearch}
            onClick={openRecordsSearchPage}
            keyboard={['/']}
          />
          <NavigationDrawerItem
            label={t`Settings`}
            to={getSettingsPath(SettingsPath.ProfilePage)}
            onClick={() => {
              setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
              setIsNavigationDrawerExpanded(true);
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            Icon={IconSettings}
          />
          <ChatNavigationNavItem />
          <NavigationDrawerItem
            label="Bot"
            to={'/chatbot'}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            Icon={IconRobot}
          />

          <NavigationDrawerItem
            label="Traceable"
            to={`/objects/charges?viewId=${viewId ?? ''}`}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            Icon={IconLink}
          />
        </StyledMainSection>
      )}
      <ScrollWrapper
        contextProviderName="navigationDrawer"
        componentInstanceId={`scroll-wrapper-navigation-drawer`}
        defaultEnableXScroll={false}
        scrollbarVariant="no-padding"
      >
        <StyledInnerContainer>
          <NavigationDrawerOpenedSection />
          <CurrentWorkspaceMemberFavoritesFolders />
          <WorkspaceFavorites />
          <RemoteNavigationDrawerSection />
        </StyledInnerContainer>
      </ScrollWrapper>
    </>
  );
};
