import { useQuery } from '@apollo/client';
import { GET_EXTERNAL_EXTENSION } from '../graphql/queries/getExternalExtension';

export const useGetExternalExtension = ({ workspaceId, extNum }: { workspaceId: string; extNum?: string }) => {
  const { data, loading, error, refetch } = useQuery(GET_EXTERNAL_EXTENSION, {
    variables: {
      workspaceId,
      extNum,
    },
    skip: !workspaceId || !extNum,
  });

  return {
    data: data?.getExternalExtension,
    loading,
    error,
    refetch,
  };
};