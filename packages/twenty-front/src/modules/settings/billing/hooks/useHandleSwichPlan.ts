import { SWITCH_PLAN_MODAL_ID } from '@/settings/billing/constants/ChangeSubscriptionModalId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { useLingui } from '@lingui/react/macro';
import console from 'console';
import { useSwitchPlanMutation } from '~/generated-metadata/graphql';

export const useHandleSwichPlan = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { closeModal } = useModal();

  const { t } = useLingui();

  const [switchPlan, { loading }] = useSwitchPlanMutation({
    onCompleted: () => {
      enqueueSuccessSnackBar({
        message: t`Plan changed sucessfuly`,
      });

      closeModal(SWITCH_PLAN_MODAL_ID);
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        message: t`Error while changing plan, try againg later.`,
        options: {
          detailedMessage: error.message,
        },
      });

      // eslint-disable-next-line no-console
      console.error('Error changing plan', error);
    },
    refetchQueries: [GET_CURRENT_USER],
  });

  return {
    switchPlan,
    loading,
  };
};
