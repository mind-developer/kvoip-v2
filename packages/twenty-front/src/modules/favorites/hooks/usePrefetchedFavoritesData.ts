import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Favorite } from '@/favorites/types/Favorite';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilValue } from 'recoil';

type PrefetchedFavoritesData = {
  favorites: Favorite[];
  workspaceFavorites: Favorite[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesData = (): PrefetchedFavoritesData => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const prefetchFavorites = useRecoilValue(prefetchFavoritesState);

  const favorites = prefetchFavorites.filter(
    (favorite) => favorite.forWorkspaceMemberId === currentWorkspaceMemberId,
  );

  const workspaceFavorites = prefetchFavorites.filter(
    (favorite) => favorite.forWorkspaceMemberId === null,
  );

  const workspaceFavorites = _favorites.filter(
    (favorite) => favorite.workspaceMemberId === null,
  );

  const { upsertRecordsInCache: upsertFavorites } =
    usePrefetchRunQuery<Favorite>({
      prefetchKey: PrefetchKey.AllFavorites,
    });

  return {
    favorites,
    workspaceFavorites,
    currentWorkspaceMemberId,
  };
};
