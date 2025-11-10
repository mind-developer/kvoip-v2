// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_DIALING_PLANS } from '@/settings/service-center/telephony/graphql/queries/getAllDialingPlans';
import { DialingPlans } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllDialingPlansReturn = {
  dialingPlans: DialingPlans[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllDialingPlans = (): UseFindAllDialingPlansReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: telephonysData,
    loading,
    refetch,
  } = useQuery(GET_ALL_DIALING_PLANS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  return {
    dialingPlans: telephonysData?.getTelephonyPlans,
    loading,
    refetch,
  };
};
