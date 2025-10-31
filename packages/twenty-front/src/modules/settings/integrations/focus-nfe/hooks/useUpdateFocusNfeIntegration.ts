import { UPDATE_FOCUS_NFE_INTEGRATION } from '@/settings/integrations/focus-nfe/graphql/mutation/updateFocusNfeIntegration';
import { type UpdateFocusNfeIntegrationInput } from '@/settings/integrations/focus-nfe/types/UpdateFocusNfeIntegrationInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UpdateFocusNfeIntegration {
  updateFocusNfeIntegration: (
    updateInput: UpdateFocusNfeIntegrationInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateFocusNfeIntegration = (): UpdateFocusNfeIntegration => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [updateFocusNfeIntegrationMutation, { loading, error }] = useMutation(
    UPDATE_FOCUS_NFE_INTEGRATION,
    {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Focus NFe integration updated successfully!`,
        });
      },
    },
  );

  const updateFocusNfeIntegration = async (
    updateInput: UpdateFocusNfeIntegrationInput,
  ) => {
    const input = {
      ...updateInput,
    };

    try {
      await updateFocusNfeIntegrationMutation({
        variables: {
          updateInput: input,
        },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Error updating role`,
      });
    }
  };

  return {
    updateFocusNfeIntegration: updateFocusNfeIntegration,
    loading,
    error,
  };
};
