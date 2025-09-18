import { useMutation } from '@apollo/client';

import { CREATE_WHATSAPP_INTEGRATION } from '@/settings/integrations/meta/whatsapp/graphql/mutation/createWhatsappIntegration';
import { CreateWhatsappIntegrationInput } from '@/settings/integrations/meta/whatsapp/types/CreateWhatsappIntegrationInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';

interface CreateWhatsappIntegration {
  createWhatsappIntegration: (
    input: CreateWhatsappIntegrationInput,
  ) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateWhatsappIntegration = (): CreateWhatsappIntegration => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [createWhatsappIntegrationMutation, { data, loading, error }] =
    useMutation(CREATE_WHATSAPP_INTEGRATION, {
      onError: (error) => {
        enqueueErrorSnackBar({
          message: error.message,
        });
      },

      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Whatsapp integration created successfully!`,
        });
      },
    });

  const createWhatsappIntegration = async (
    createInput: CreateWhatsappIntegrationInput,
  ) => {
    await createWhatsappIntegrationMutation({
      variables: {
        createInput,
      },
    });
  };

  return {
    createWhatsappIntegration,
    data,
    loading,
    error,
  };
};
