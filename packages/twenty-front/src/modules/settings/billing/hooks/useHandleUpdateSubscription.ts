import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useUpdateOneTimePaidSubscriptionMutation } from '~/generated-metadata/graphql';

export const useHandleUpdateSubscription = () => {
  const [updateSubscription, { loading }] =
    useUpdateOneTimePaidSubscriptionMutation();

  const { redirect } = useRedirect();

  const { enqueueErrorSnackBar } = useSnackBar();

  const { t } = useLingui();

  const handleUpdateSubscription = async () => {
    await updateSubscription({
      onCompleted: ({ updateOneTimePaidSubscription }) => {
        redirect(updateOneTimePaidSubscription.bankSlipFileLink, '_blank');
      },
      onError: () => {
        enqueueErrorSnackBar({
          message: t`Error while updating subscription.`,
        });
      },
    });
  };

  return {
    handleUpdateSubscription,
    loading,
  };
};
