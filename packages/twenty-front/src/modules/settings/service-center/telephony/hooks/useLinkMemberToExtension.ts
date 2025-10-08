import { useMutation } from '@apollo/client';
import { LINK_MEMBER_TO_EXTENSION } from '../graphql/mutations/linkMemberToExtension';

export const useLinkMemberToExtension = () => {
  const [linkMemberToExtension, { loading, error }] = useMutation(LINK_MEMBER_TO_EXTENSION);

  const handleLinkMember = async (extensionId: string, memberId: string) => {
    try {
      const result = await linkMemberToExtension({
        variables: {
          extensionId,
          memberId,
        },
      });
      return result.data?.linkMemberToExtension;
    } catch (err) {
      console.error('Error linking member to extension:', err);
      throw err;
    }
  };

  return {
    linkMemberToExtension: handleLinkMember,
    loading,
    error,
  };
};
