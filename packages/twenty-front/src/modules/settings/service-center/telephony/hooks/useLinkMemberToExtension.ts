import { useMutation } from '@apollo/client';
import { LINK_MEMBER_TO_EXTENSION } from '../graphql/mutations/linkMemberToExtension';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useLinkMemberToExtension = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [linkMemberToExtension, { loading, error, data }] = useMutation(LINK_MEMBER_TO_EXTENSION);

  const handleLinkMember = async (numberExtension: string, memberId: string) => {
    try {
      const result = await linkMemberToExtension({
        variables: {
          numberExtension,
          memberId,
        },
      });
      return result;
    } catch (err) {
      console.error('Error linking member to extension:', err);
      // throw err;
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return {
    linkMemberToExtension: handleLinkMember,
    loading,
    error,
    data,
  };
};
