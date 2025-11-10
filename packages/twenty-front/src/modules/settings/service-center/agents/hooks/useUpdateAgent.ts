import { UPDATE_AGENT } from '@/settings/service-center/agents/graphql/mutation/updateAgent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { UpdateWorkspaceAgentInput } from '~/generated/graphql';

interface UseToggleAgentActiveReturn {
  editAgent: (updateAgentInput: UpdateWorkspaceAgentInput) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateAgent = (): UseToggleAgentActiveReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [updateAgent, { loading, error }] = useMutation(UPDATE_AGENT, {
    onError: (error) => {
      enqueueErrorSnackBar({
        message: error.message,
      });
    },
    onCompleted: () => {
      enqueueSuccessSnackBar({
        message: t`Agent updated successfully!`,
      });
    },
  });

  const editAgent = async (updateInput: UpdateWorkspaceAgentInput) => {
    try {
      await updateAgent({
        variables: {
          updateInput,
        },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Error updating agent`,
      });
    }
  };

  return {
    editAgent,
    loading,
    error,
  };
};
