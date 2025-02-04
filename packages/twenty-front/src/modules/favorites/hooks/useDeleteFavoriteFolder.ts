import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const useDeleteFavoriteFolder = () => {
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { upsertRecordsInCache } = usePrefetchRunQuery<Favorite>({
    prefetchKey: PrefetchKey.AllFavorites,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular:
      PREFETCH_CONFIG[PrefetchKey.AllFavorites].objectNameSingular,
  });

  const { readFindManyRecordsQueryInCache } =
    useReadFindManyRecordsQueryInCache({
      objectMetadataItem,
    });

  const deleteFavoriteFolder = async (folderId: string): Promise<void> => {
    await deleteOneRecord(folderId);
  };

  return {
    deleteFavoriteFolder,
  };
};
