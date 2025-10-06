import { UPDATE_TELEPHONY } from '@/settings/service-center/telephony/graphql/mutations/updateAgent';
import { UpdateTelephonyInput } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseEditTelephonyReturn {
  editTelephony: (
    id: string,
    updateTelephonyInput: UpdateTelephonyInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateTelephony = (): UseEditTelephonyReturn => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [updateTelephony, { loading, error }] = useMutation(UPDATE_TELEPHONY, {
    onCompleted: () => {
      enqueueSuccessSnackBar({
        message: 'Agent updated successfully!',
      });
    },
  });

  const editTelephony = async (
    id: string,
    updateTelephonyInput: UpdateTelephonyInput,
  ) => {
    try {
      await updateTelephony({
        variables: {
          id,
          updateTelephonyInput,
        },
      });
    } catch (err) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    }
  };

  return {
    loading,
    error,
    editTelephony,
  };
};
