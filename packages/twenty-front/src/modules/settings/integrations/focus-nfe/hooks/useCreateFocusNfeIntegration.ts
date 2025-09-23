import { useMutation } from '@apollo/client';

import { CREATE_FOCUS_NFE_INTEGRATION } from '@/settings/integrations/focus-nfe/graphql/mutation/createFocusNfeIntegration';

import { CreateFocusNfeIntegrationInput } from '@/settings/integrations/focus-nfe/types/CreateFocusNfeIntegrationInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';

interface CreateFocusNfeIntegration {
  createFocusNfeIntegration: (
    input: CreateFocusNfeIntegrationInput,
  ) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateFocusNfeIntegration = (): CreateFocusNfeIntegration => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [createFocusNfeIntegrationMutation, { data, loading, error }] =
    useMutation(CREATE_FOCUS_NFE_INTEGRATION, {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Focus NFe integration created successfully!`,
        });
      },
    });

  const createFocusNfeIntegration = async (
    input: CreateFocusNfeIntegrationInput,
  ) => {
    const createInput = {
      ...input,
    };

    await createFocusNfeIntegrationMutation({
      variables: {
        createInput,
      },
    });
  };

  return {
    createFocusNfeIntegration,
    data,
    loading,
    error,
  };
};
