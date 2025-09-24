import { DELETE_FINANCIAL_CLOSING_BY_ID } from '@/settings/financial-closing/graphql/mutations/deleteFinancialClosing';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseDeleteFinancialClosingByIdReturn {
  deleteFinancialClosingById: (financialClosingId: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useDeleteFinancialClosing = (): UseDeleteFinancialClosingByIdReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [deleteFinancialClosingMutation, { loading, error }] = useMutation(
    DELETE_FINANCIAL_CLOSING_BY_ID,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Financial closing deleted successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const deleteFinancialClosingById = async (financialClosingId: string) => {
    try {
      await deleteFinancialClosingMutation({
        variables: { financialClosingId },
      });
    } catch (err) {
      enqueueSnackBar('Error deleting financial closing', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    deleteFinancialClosingById,
    loading,
    error,
  };
};
