import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
    IconBuildingSkyscraper,
    IconList,
    IconMoneybag,
    IconPhone,
} from 'twenty-ui/display';

export const AdminWorkspaceNavigationItems = () => {
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
      { objectNamePlural: objectMetadata?.namePlural ?? objectName },
      lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
    );
  };

  return (
    <>
      <NavigationDrawerSectionTitle label={t`Admin`} />
      <NavigationDrawerItem
        label={t`Workspaces`}
        to={getNavigationPath('tenants')}
        // eslint-disable-next-line @nx/workspace-no-navigate-prefer-link
        onClick={() => {
          navigate(getNavigationPath('tenants'));
        }}
        Icon={IconBuildingSkyscraper}
      />
      <NavigationDrawerItem
        label={t`Subscriptions`}
        to={getNavigationPath('subscriptions')}
        // eslint-disable-next-line @nx/workspace-no-navigate-prefer-link
        onClick={() => {
          navigate(getNavigationPath('subscriptions'));
        }}
        Icon={IconMoneybag}
      />
      <NavigationDrawerItem
        label={t`Tax Invocies`}
        to={getNavigationPath('tax-invoices')}
        // eslint-disable-next-line @nx/workspace-no-navigate-prefer-link
        onClick={() => {
          navigate(getNavigationPath('tax-invoices'));
        }}
        Icon={IconList}
      />
      <NavigationDrawerItem
        label={t`Telephony`}
        to={getNavigationPath('telephony')}
        // eslint-disable-next-line @nx/workspace-no-navigate-prefer-link
        onClick={() => {
          navigate(getNavigationPath('telephony'));
        }}
        Icon={IconPhone}
      />
    </>
  );
};
