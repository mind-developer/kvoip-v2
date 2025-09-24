import { TOGGLE_INTER_INTEGRATION_STATUS } from '@/settings/integrations/inter/graphql/mutation/toggleInterIntegrationStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface ToggleInterIntegration {
  toggleInterIntegrationDisable: (integrationId: string) => Promise<void>;
}

export const useToggleInterIntegration = (): ToggleInterIntegration => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const [toggleInterIntegrationMutation] = useMutation(
    TOGGLE_INTER_INTEGRATION_STATUS,
    {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
    },
  );

  const toggleInterIntegrationDisable = async (integrationId: string) => {
    await toggleInterIntegrationMutation({
      variables: {
        integrationId,
      },
    });
  };

  return {
    toggleInterIntegrationDisable,
  };
};
