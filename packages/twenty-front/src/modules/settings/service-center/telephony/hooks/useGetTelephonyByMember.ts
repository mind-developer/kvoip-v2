// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_TELEPHONY_BY_MEMBER } from '@/settings/service-center/telephony/graphql/queries/getTelephonyByMember';
import { TelephonyExtension, Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseGetTelephonyByMemberReturn = {
  telephony: Telephony;
  loading: boolean;
  refetch: () => void;
}

export const useGetTelephonyByMember = ({
  memberId,
}: {
  memberId?: string;
}): UseGetTelephonyByMemberReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data, loading, refetch } = useQuery(GET_TELEPHONY_BY_MEMBER, {
    variables: { memberId, workspaceId: currentWorkspace?.id },
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  return {
    telephony: data?.getTelephonyByMember,
    loading,
    refetch,
  };
};
