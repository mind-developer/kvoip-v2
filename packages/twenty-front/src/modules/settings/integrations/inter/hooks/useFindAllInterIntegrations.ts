import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_INTER_INTEGRATIONS } from '@/settings/integrations/inter/graphql/query/interIntegrationByWorkspace';
import { FindInterIntegration } from '@/settings/integrations/inter/types/FindInterIntegrationInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type FindAllInterIntegrations = {
  interIntegrations: FindInterIntegration[];
  refetchInter: () => void;
  loading: boolean;
};

export const useFindAllInterIntegrations = (): FindAllInterIntegrations => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data,
    refetch: refetchInter,
    loading,
  } = useQuery(GET_ALL_INTER_INTEGRATIONS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: error.message,
      });
    },
  });

  return {
    interIntegrations: data?.interIntegrationsByWorkspace,
    refetchInter,
    loading,
  };
};
