// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';
import { GET_ALL_EXTERNAL_EXTENSIONS } from '@/settings/service-center/telephony/graphql/queries/getAllExternalExtensions';

type UseFindAllTelephonyReturn = {
  telephonys: Telephony[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllExternalExtensions = (): UseFindAllTelephonyReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: telephonysData,
    loading,
    refetch,
  } = useQuery(GET_ALL_EXTERNAL_EXTENSIONS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  return {
    telephonys: telephonysData?.findAllExternalExtensions,
    loading,
    refetch,
  };
};
