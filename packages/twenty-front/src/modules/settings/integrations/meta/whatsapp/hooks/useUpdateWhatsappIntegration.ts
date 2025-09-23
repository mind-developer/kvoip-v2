import { UPDATE_WHATSAPP_INTEGRATION } from '@/settings/integrations/meta/whatsapp/graphql/mutation/updateWhatsappIntegration';
import { UpdateWhatsappIntegrationInput } from '@/settings/integrations/meta/whatsapp/types/UpdateWhatsappIntegrationInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UpdateWhatsappIntegration {
  updateWhatsappIntegration: (
    updateInput: UpdateWhatsappIntegrationInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateWhatsappIntegration = (): UpdateWhatsappIntegration => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [updateWhatsappIntegrationMutation, { loading, error }] = useMutation(
    UPDATE_WHATSAPP_INTEGRATION,
    {
      onError: (error) => {
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Whatsapp integration updated successfully!`,
        });
      },
    },
  );

  const updateWhatsappIntegration = async (
    updateInput: UpdateWhatsappIntegrationInput,
  ) => {
    try {
      await updateWhatsappIntegrationMutation({
        variables: {
          updateInput,
        },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Error updating role`,
      });
    }
  };

  return {
    updateWhatsappIntegration: updateWhatsappIntegration,
    loading,
    error,
  };
};
