import { CREATE_FINANCIAL_CLOSING } from '@/settings/financial-closing/graphql/mutations/createFinancialClosing';
import { CreateFinancialClosingInput } from '@/settings/financial-closing/types/CreateFinancialClosingInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UserCreateFinancialClosingReturn {
  createFinancialClosing: (createInput: CreateFinancialClosingInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateFinancialClosing = (): UserCreateFinancialClosingReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [createFinancialClosingMutation, { data, loading, error }] = useMutation(
    CREATE_FINANCIAL_CLOSING,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Financial closing created successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const createFinancialClosing = async (createInput: CreateFinancialClosingInput) => {
    try {
      await createFinancialClosingMutation({
        variables: { createInput },
      });
    } catch (err) {
      enqueueSnackBar('Financial closing creation error', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    createFinancialClosing,
    data,
    loading,
    error,
  };
};
