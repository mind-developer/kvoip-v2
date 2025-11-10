// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_SECTORS } from '@/settings/service-center/sectors/graphql/query/sectorsByWorkspace';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllSectorsReturn = {
  sectors: Sector[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllSectors = (): UseFindAllSectorsReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: sectorsData,
    loading,
    refetch,
  } = useQuery(GET_ALL_SECTORS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  return {
    sectors: sectorsData?.sectorsByWorkspace,
    loading,
    refetch,
  };
};
