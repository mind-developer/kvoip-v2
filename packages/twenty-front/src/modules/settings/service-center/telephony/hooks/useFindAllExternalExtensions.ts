// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_EXTERNAL_EXTENSIONS } from '@/settings/service-center/telephony/graphql/queries/getAllExternalExtensions';
import { ExternalTelephonyExtension } from '@/settings/service-center/telephony/types/ExternalTelephonyExtension';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllExternalExtensionsReturn = {
  extensions: ExternalTelephonyExtension[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllExternalExtensions = (): UseFindAllExternalExtensionsReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: extensionsData,
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
    extensions: extensionsData?.findAllExternalExtensions,
    loading,
    refetch,
  };
};
