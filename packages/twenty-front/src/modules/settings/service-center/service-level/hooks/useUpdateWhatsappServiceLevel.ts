import { UPDATE_SERVICE_LEVEL } from '@/settings/service-center/service-level/graphql/mutation/updateWhatsappServiceLevel';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';

interface UseUpdateServiceLevelReturn {
  updateSla: (integrationId: string, sla: number) => Promise<void>;
}

export const useUpdateWhatsappServiceLevel =
  (): UseUpdateServiceLevelReturn => {
    const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

    const { t } = useLingui();

    const [updateServiceLevel] = useMutation(UPDATE_SERVICE_LEVEL, {
      onError: (error) => {
        // TODO: Add proper error message
        enqueueErrorSnackBar({
          message: (error as Error).message,
        });
      },
      onCompleted: () => {
        enqueueErrorSnackBar({
          message: t`Service Level updated successfully!`,
        });
      },
    });

    const updateSla = async (integrationId: string, sla: number) => {
      await updateServiceLevel({
        variables: {
          integrationId,
          sla,
        },
      });
    };

    return {
      updateSla,
    };
  };
