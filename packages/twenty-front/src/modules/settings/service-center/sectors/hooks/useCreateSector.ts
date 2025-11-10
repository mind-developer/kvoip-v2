import { CREATE_SECTOR } from '@/settings/service-center/sectors/graphql/mutation/createSector';
import { CreateSectorInput } from '@/settings/service-center/sectors/types/CreateSectorInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UserCreateSectorReturn {
  createSector: (createInput: CreateSectorInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateSector = (): UserCreateSectorReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [createSectorMutation, { data, loading, error }] = useMutation(
    CREATE_SECTOR,
    {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: (error as Error).message,
        });
      },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Sector created successfully!`,
        });
      },
    },
  );

  const createSector = async (createInput: CreateSectorInput) => {
    try {
      await createSectorMutation({
        variables: { createInput },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Sector creation error`,
      });
    }
  };

  return {
    createSector,
    data,
    loading,
    error,
  };
};
