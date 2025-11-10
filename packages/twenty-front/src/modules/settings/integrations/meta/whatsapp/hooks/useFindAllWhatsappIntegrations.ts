import { useQuery } from '@apollo/client';

import { FindWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/FindWhatsappIntegrationInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { GET_ALL_WHATSAPP_INTEGRATIONS } from '../graphql/query/whatsappIntegrationByWorkspace';

type FindAllWhatsappIntegrations = {
  whatsappIntegrations: FindWhatsappIntegration[];
  refetchWhatsapp: () => void;
  loading: boolean;
};

export const useFindAllWhatsappIntegrations =
  (): FindAllWhatsappIntegrations => {
    const { enqueueErrorSnackBar } = useSnackBar();

    const {
      data,
      refetch: refetchWhatsapp,
      loading,
    } = useQuery(GET_ALL_WHATSAPP_INTEGRATIONS, {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: error.message,
        });
      },
    });

    return {
      whatsappIntegrations: data?.whatsappIntegrationsByWorkspace,
      refetchWhatsapp,
      loading,
    };
  };
