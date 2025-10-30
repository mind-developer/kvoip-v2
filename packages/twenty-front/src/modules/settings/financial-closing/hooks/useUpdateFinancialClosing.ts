import { UPDATE_FINANCIAL_CLOSING } from '@/settings/financial-closing/graphql/mutations/updateFinancialClosing';
import { type UpdateFinancialClosingInput } from '@/settings/financial-closing/types/UpdateFinancialClosingInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UserUpdateFinancialClosingReturn {
  editFinancialClosing: (
    updateInput: UpdateFinancialClosingInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateFinancialClosing =
  (): UserUpdateFinancialClosingReturn => {
    const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

    const [updateFinancialClosingMutation, { loading, error }] = useMutation(
      UPDATE_FINANCIAL_CLOSING,
      {
        onError: (error) => {
          enqueueErrorSnackBar({
            message: error.message,
          });
        },
        onCompleted: () => {
          enqueueSuccessSnackBar({
            message: 'Financial closing updated successfully!',
          });
        },
      },
    );

    const editFinancialClosing = async (
      updateInput: UpdateFinancialClosingInput,
    ) => {
      try {
        await updateFinancialClosingMutation({
          variables: {
            updateInput,
          },
        });
      } catch (err) {
        enqueueErrorSnackBar({
          message: 'Error updating financial closing',
        });
      }
    };

    return {
      loading,
      error,
      editFinancialClosing,
    };
  };
