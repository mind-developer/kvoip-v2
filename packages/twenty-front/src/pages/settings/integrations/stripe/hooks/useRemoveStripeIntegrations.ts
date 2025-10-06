import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { REMOVE_STRIPE_INTEGRATION } from '~/pages/settings/integrations/stripe/graphql/mutation/removeStripeIntegration';

interface ToggleStripeIntegration {
  deleteStripeIntegration: (accountId: string) => Promise<void>;
}

export const useRemoveStripeIntegration = (): ToggleStripeIntegration => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const [removeStripeIntegration] = useMutation(REMOVE_STRIPE_INTEGRATION, {
    onError: (error) => {
      // TODO: Add proper errror message
      enqueueErrorSnackBar({
        message: error.message,
      });
    },
    onCompleted: () => {
      enqueueSuccessSnackBar({
        message: 'Successful integration excluded!',
      });
    },
  });

  const deleteStripeIntegration = async (accountId: string) => {
    await removeStripeIntegration({
      variables: {
        accountId,
      },
    });
  };

  return {
    deleteStripeIntegration,
  };
};
