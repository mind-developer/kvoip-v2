import { UPDATE_INTER_INTEGRATION } from '@/settings/integrations/inter/graphql/mutation/updateInterIntegration';
import { UpdateInterIntegrationInput } from '@/settings/integrations/inter/types/UpdateInterIntegrationInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UpdateInterIntegration {
  updateInterIntegration: (
    updateInput: UpdateInterIntegrationInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateInterIntegration = (): UpdateInterIntegration => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [updateInterIntegrationMutation, { loading, error }] = useMutation(
    UPDATE_INTER_INTEGRATION,
    {
      onError: (error) => {
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Inter integration updated successfully!`,
        });
      },
    },
  );

  const updateInterIntegration = async (
    updateInput: UpdateInterIntegrationInput,
  ) => {
    // TODO: Remove base64 conversion and let the server handle the encryption
    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

    const privateKeyContent = updateInput.privateKey
      ? typeof updateInput.privateKey === 'string'
        ? updateInput.privateKey
        : await toBase64(updateInput.privateKey as File)
      : null;

    const certificateContent = updateInput.certificate
      ? typeof updateInput.certificate === 'string'
        ? updateInput.certificate
        : await toBase64(updateInput.certificate as File)
      : null;

    const input = {
      ...updateInput,
      privateKey: privateKeyContent,
      certificate: certificateContent,
    };

    try {
      await updateInterIntegrationMutation({
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
    updateInterIntegration: updateInterIntegration,
    loading,
    error,
  };
};
