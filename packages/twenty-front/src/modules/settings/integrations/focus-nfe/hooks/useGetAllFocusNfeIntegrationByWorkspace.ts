import { useQuery } from '@apollo/client';

import { GET_FOCUS_NFE_INTEGRATIONS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/query/getFocusNfeIntegrationsByWorkspace';
import { FindFocusNfeIntegration } from '@/settings/integrations/focus-nfe/types/FindFocusNfeIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type GetAllFocusNfeIntegrationsByWorkspace = {
  focusNfeIntegrations: FindFocusNfeIntegration[];
  refetchFocusNfe: () => void;
  loading: boolean;
};

export const useGetAllFocusNfeIntegrationsByWorkspace =
  (): GetAllFocusNfeIntegrationsByWorkspace => {
    const { enqueueSnackBar } = useSnackBar();

    const {
      data,
      refetch: refetchFocusNfe,
      loading,
    } = useQuery(GET_FOCUS_NFE_INTEGRATIONS_BY_WORKSPACE, {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
    });
    return {
      focusNfeIntegrations: data?.getFocusNfeIntegrationsByWorkspace,
      refetchFocusNfe,
      loading,
    };
  };
