import { GET_WHATSAPP_TEMPLATES } from '@/chat/client-chat/graphql/query/getWhatsappTemplates';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client';

export const useGetWhatsappTemplates = (integrationId: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const { data, loading, error, refetch } = useQuery(GET_WHATSAPP_TEMPLATES, {
    client: apolloCoreClient,
    variables: { input: { integrationId } },
  });

  return {
    templates: data?.getWhatsappTemplates?.templates || [],
    loading,
    error,
    refetch,
  };
};
