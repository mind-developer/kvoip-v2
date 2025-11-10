import { UPDATE_SECTOR } from '@/settings/service-center/sectors/graphql/mutation/updateSector';
import { UpdateSectorInput } from '@/settings/service-center/sectors/types/UpdateSectorInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UseToggleSectorActiveReturn {
  editSector: (updateInput: UpdateSectorInput) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateSector = (): UseToggleSectorActiveReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [updateSector, { loading, error }] = useMutation(UPDATE_SECTOR, {
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
    onCompleted: () => {
      enqueueSuccessSnackBar({
        message: t`Sector updated successfully!`,
      });
    },
  });

  const editSector = async (updateInput: UpdateSectorInput) => {
    try {
      await updateSector({
        variables: {
          updateInput,
        },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Error updating sector`,
      });
    }
  };

  return {
    loading,
    error,
    editSector,
  };
};
