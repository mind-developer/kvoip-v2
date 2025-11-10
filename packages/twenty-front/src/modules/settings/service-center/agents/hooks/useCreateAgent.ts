import { CREATE_AGENT } from '@/settings/service-center/agents/graphql/mutation/createAgent';
import { CreateAgentInput } from '@/settings/service-center/agents/types/CreateAgentInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UserCreateAgentReturn {
  createAgent: (createInput: CreateAgentInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateAgent = (): UserCreateAgentReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [createAgentMutation, { data, loading, error }] = useMutation(
    CREATE_AGENT,
    {
      onError: (error) => {
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Agent created successfully!`,
        });
      },
    },
  );

  const createAgent = async (createInput: CreateAgentInput) => {
    try {
      await createAgentMutation({
        variables: { createInput },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Agent creation error`,
      });
    }
  };

  return {
    createAgent,
    data,
    loading,
    error,
  };
};
