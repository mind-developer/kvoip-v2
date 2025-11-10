import { TOGGLE_WHATSAPP_INTEGRATION_STATUS } from '@/settings/integrations/meta/whatsapp/graphql/mutation/toggleWhatsappIntegrationStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface ToggleWhatsappIntegration {
  toggleWhatsappIntegrationDisable: (integrationId: string) => Promise<void>;
}

export const useToggleWhatsappIntegration = (): ToggleWhatsappIntegration => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const [toggleWhatsappIntegrationMutation] = useMutation(
    TOGGLE_WHATSAPP_INTEGRATION_STATUS,
    {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
    },
  );

  const toggleWhatsappIntegrationDisable = async (integrationId: string) => {
    await toggleWhatsappIntegrationMutation({
      variables: {
        integrationId,
      },
    });
  };

  return {
    toggleWhatsappIntegrationDisable,
  };
};
