import { UPDATE_ISSUER_MUTATION } from '@/settings/integrations/focus-nfe/graphql/mutation/updateIssuer';
import { GET_ALL_ISSUERS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/query/getAllIssuersByWorkspace';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { type Issuer, type UpdateIssuerData } from '~/types/Issuer'; // Assuming Issuer type is needed for return

export const useUpdateIssuer = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [updateIssuerMutation, { loading }] = useMutation<
    { updateIssuer: Issuer },
    { id: string; updateInput: UpdateIssuerData }
  >(UPDATE_ISSUER_MUTATION, {
    refetchQueries: [{ query: GET_ALL_ISSUERS_BY_WORKSPACE }],
  });

  const updateIssuer = async (id: string, data: UpdateIssuerData) => {
    try {
      const result = await updateIssuerMutation({
        variables: { id, updateInput: data },
      });
      enqueueSuccessSnackBar({
        message: t`Issuer updated successfully!`,
      });
      return result.data?.updateIssuer;
    } catch (error) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message || t`Failed to update issuer.`,
        options: {
          detailedMessage: (error as Error)?.message,
        },
      });
      throw error;
    }
  };

  return { updateIssuer, loading };
};
