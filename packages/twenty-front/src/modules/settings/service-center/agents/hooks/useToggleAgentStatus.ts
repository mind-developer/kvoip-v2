import { TOGGLE_AGENT_STATUS } from '@/settings/service-center/agents/graphql/mutation/toggleAgentStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UseToggleAgentStatusByIdReturn {
  toggleAgentStatus: (agentId: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useToggleAgentStatus = (): UseToggleAgentStatusByIdReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { t } = useLingui();

  const [toggleAgentStatusMutation, { loading, error }] = useMutation(
    TOGGLE_AGENT_STATUS,
    {
      onError: (error) => {
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Successful agent status change`,
        });
      },
    },
  );

  const toggleAgentStatus = async (agentId: string) => {
    try {
      await toggleAgentStatusMutation({
        variables: { agentId },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Error toggling agent status`,
      });
    }
  };

  return {
    toggleAgentStatus,
    loading,
    error,
  };
};
