import { FAVORITES_KVOIP_SYSTEM_EXCLUDE_ITEMS } from '@/favorites/constants/FavoritesKvoipSystemExcludeItems';
import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useLingui } from '@lingui/react/macro';

export const WorkspaceFavorites = () => {
  const { workspaceFavoritesObjectMetadataItems } = useWorkspaceFavorites();

  const loading = useIsPrefetchLoading();
  const { t } = useLingui();

  if (loading) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  const filteredWorkspaceFavoritesObjectMetadataItems =
    workspaceFavoritesObjectMetadataItems.filter(
      (item: any) =>
        !FAVORITES_KVOIP_SYSTEM_EXCLUDE_ITEMS.includes(item.namePlural),
    );

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={t`Workspace`}
      objectMetadataItems={filteredWorkspaceFavoritesObjectMetadataItems}
      isRemote={false}
    />
  );
};
