import { UPDATE_FINANCIAL_CLOSING } from '@/settings/financial-closing/graphql/mutations/updateFinancialClosing';
import { UpdateFinancialClosingInput } from '@/settings/financial-closing/types/UpdateFinancialClosingInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UserUpdateFinancialClosingReturn {
  editFinancialClosing: (updateInput: UpdateFinancialClosingInput) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateFinancialClosing = (): UserUpdateFinancialClosingReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateFinancialClosingMutation, { loading, error }] = useMutation(
    UPDATE_FINANCIAL_CLOSING, 
    {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: () => {
      enqueueSnackBar('Financial closing updated successfully!', {
        variant: SnackBarVariant.Success,
      });
    },
  });

  const editFinancialClosing = async (updateInput: UpdateFinancialClosingInput) => {
    try {
      await updateFinancialClosingMutation({
        variables: {
          updateInput,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating financial closing', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    loading,
    error,
    editFinancialClosing,
  };
};
