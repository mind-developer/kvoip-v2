import { DELETE_SECTOR_BY_ID } from '@/settings/service-center/sectors/graphql/mutation/deleteSector';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UseDeleteSectorByIdReturn {
  deleteSectorById: (sectorId: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useDeleteSector = (): UseDeleteSectorByIdReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [deleteSectorMutation, { loading, error }] = useMutation(
    DELETE_SECTOR_BY_ID,
    {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: (error as Error).message,
        });
      },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Sector deleted successfully!`,
        });
      },
    },
  );

  const deleteSectorById = async (sectorId: string) => {
    try {
      await deleteSectorMutation({
        variables: { sectorId },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Error deleting sector`,
      });
    }
  };

  return {
    deleteSectorById,
    loading,
    error,
  };
};
