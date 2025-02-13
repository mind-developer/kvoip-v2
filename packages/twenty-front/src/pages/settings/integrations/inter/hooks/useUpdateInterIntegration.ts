import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { UPDATE_INTER_INTEGRATION } from '~/pages/settings/integrations/inter/graphql/mutation/updateInterIntegration';
import { UpdateInterIntegrationInput } from '~/pages/settings/integrations/inter/types/InterConnection';

interface UpdateInterIntegration {
  updateInterIntegration: (input: UpdateInterIntegrationInput) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateInterIntegration = (): UpdateInterIntegration => {
  const { enqueueSnackBar } = useSnackBar();

  const [upddateInterIntegrationMutation, { loading, error }] = useMutation(
    UPDATE_INTER_INTEGRATION,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Inter Connection updated successfully', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const updateInterIntegration = async (input: UpdateInterIntegrationInput) => {
    try {
      await upddateInterIntegrationMutation({
        variables: {
          updateInterIntegrationInput: input,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error to update Inter Conncetion', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    updateInterIntegration: updateInterIntegration,
    loading,
    error,
  };
};
