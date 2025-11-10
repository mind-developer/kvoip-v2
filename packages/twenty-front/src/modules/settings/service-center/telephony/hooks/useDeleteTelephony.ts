import { DELETE_TELEPHONY } from '@/settings/service-center/telephony/graphql/mutations/deleteTelephony';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseDeleteTelephonyReturn {
  deleteTelephony: (id: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useDeleteTelephony = (): UseDeleteTelephonyReturn => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [deleteTelephonyMutation, { loading, error }] = useMutation(
    DELETE_TELEPHONY,
    {
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: 'Telephony deleted successfully!',
        });
      },
    },
  );

  const deleteTelephony = async (id: string) => {
    try {
      await deleteTelephonyMutation({
        variables: {
          id,
        },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return {
    loading,
    error,
    deleteTelephony,
  };
};
