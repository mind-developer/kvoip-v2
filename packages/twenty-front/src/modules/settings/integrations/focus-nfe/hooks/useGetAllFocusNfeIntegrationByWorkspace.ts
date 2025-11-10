import { useQuery } from '@apollo/client';

import { GET_FOCUS_NFE_INTEGRATIONS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/query/getFocusNfeIntegrationsByWorkspace';
import { type FindFocusNfeIntegration } from '@/settings/integrations/focus-nfe/types/FindFocusNfeIntegrationInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type GetAllFocusNfeIntegrationsByWorkspace = {
  focusNfeIntegrations: FindFocusNfeIntegration[];
  refetchFocusNfe: () => void;
  loading: boolean;
};

export const useGetAllFocusNfeIntegrationsByWorkspace =
  (): GetAllFocusNfeIntegrationsByWorkspace => {
    const { enqueueErrorSnackBar } = useSnackBar();

    const {
      data,
      refetch: refetchFocusNfe,
      loading,
    } = useQuery(GET_FOCUS_NFE_INTEGRATIONS_BY_WORKSPACE, {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
    });
    return {
      focusNfeIntegrations: data?.getFocusNfeIntegrationsByWorkspace,
      refetchFocusNfe,
      loading,
    };
  };
