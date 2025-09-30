/* @kvoip-woulz proprietary */
import { DELETE_FINANCIAL_CLOSING_BY_ID } from '@/settings/financial-closing/graphql/mutations/deleteFinancialClosing';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseDeleteFinancialClosingByIdReturn {
  deleteFinancialClosingById: (financialClosingId: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useDeleteFinancialClosing =
  (): UseDeleteFinancialClosingByIdReturn => {
    const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

    const [deleteFinancialClosingMutation, { loading, error }] = useMutation(
      DELETE_FINANCIAL_CLOSING_BY_ID,
      {
        onError: (error) => {
          enqueueErrorSnackBar({
            message: error.message,
          });
        },
        onCompleted: () => {
          enqueueSuccessSnackBar({
            message: 'Financial closing deleted successfully!',
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
        enqueueErrorSnackBar({
          message: 'Error deleting financial closing',
        });
      }
    };

    return {
      deleteFinancialClosingById,
      loading,
      error,
    };
  };
