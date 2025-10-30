import { CREATE_FINANCIAL_CLOSING } from '@/settings/financial-closing/graphql/mutations/createFinancialClosing';
import { type CreateFinancialClosingInput } from '@/settings/financial-closing/types/CreateFinancialClosingInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UserCreateFinancialClosingReturn {
  createFinancialClosing: (
    createInput: CreateFinancialClosingInput,
  ) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateFinancialClosing =
  (): UserCreateFinancialClosingReturn => {
    const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

    const [createFinancialClosingMutation, { data, loading, error }] =
      useMutation(CREATE_FINANCIAL_CLOSING, {
        onError: (error) => {
          enqueueErrorSnackBar({
            message: error.message,
          });
        },
        onCompleted: () => {
          enqueueSuccessSnackBar({
            message: 'Financial closing created successfully!',
          });
        },
      });

    const createFinancialClosing = async (
      createInput: CreateFinancialClosingInput,
    ) => {
      try {
        await createFinancialClosingMutation({
          variables: { createInput },
        });
      } catch (err) {
        enqueueErrorSnackBar({
          message: 'Financial closing creation error',
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
