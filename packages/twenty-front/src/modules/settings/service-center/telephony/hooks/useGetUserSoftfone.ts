// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_USER_SOFTFONE } from '@/settings/service-center/telephony/graphql/queries/getUserSoftfone';
import { type TelephonyExtension } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseGetUserSoftfoneReturn = {
  telephonyExtension: TelephonyExtension;
  loading: boolean;
  refetch: () => void;
};

export const useGetUserSoftfone = ({
  extNum,
}: {
  extNum?: string;
}): UseGetUserSoftfoneReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data, loading, refetch } = useQuery(GET_USER_SOFTFONE, {
    variables: { extNum, workspaceId: currentWorkspace?.id },
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  return {
    telephonyExtension: data?.getUserSoftfone,
    loading,
    refetch,
  };
};
