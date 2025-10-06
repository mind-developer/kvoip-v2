// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_PABX } from '@/settings/service-center/telephony/graphql/queries/getAllPABX';
import { TelephonyExtension } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllPABXReturn = {
  telephonyExtensions: TelephonyExtension[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllPABX = (): UseFindAllPABXReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: telephonysData,
    loading,
    refetch,
  } = useQuery(GET_ALL_PABX, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  return {
    telephonyExtensions: telephonysData?.getAllExtensions,
    loading,
    refetch,
  };
};
