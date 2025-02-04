import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilValue } from 'recoil';

type PrefetchedFavoritesFoldersData = {
  favoriteFolders: FavoriteFolder[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesFoldersData =
  (): PrefetchedFavoritesFoldersData => {
    const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;

    const prefetchFavoriteFolders = useRecoilValue(
      prefetchFavoriteFoldersState,
    );

    const { upsertRecordsInCache: upsertFavoriteFolders } =
      usePrefetchRunQuery<FavoriteFolder>({
        prefetchKey: PrefetchKey.AllFavoritesFolders,
      });

    return {
      favoriteFolders: prefetchFavoriteFolders,
      currentWorkspaceMemberId,
    };
  };
