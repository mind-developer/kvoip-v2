import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { CREATE_TELEPHONY } from '../graphql/mutations/createTelephony';
import { CreateTelephonyInput } from '../types/SettingsServiceCenterTelephony';

interface UserCreateTelephonyReturn {
  createTelephony: (inputTelephony: CreateTelephonyInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateTelephony = (): UserCreateTelephonyReturn => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { t } = useLingui();

  const [createTelephonyMutation, { data, loading, error }] = useMutation(
    CREATE_TELEPHONY,
    {
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Telephony extension added successfully!`,
        });
      },
    },
  );

  const createTelephony = async (
    createTelephonyInput: CreateTelephonyInput,
  ) => {
    try {
      await createTelephonyMutation({
        variables: { createTelephonyInput: createTelephonyInput },
      });
    } catch (err) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: t`Telephony creation error`,
      });
    }
  };

  return {
    createTelephony,
    data,
    loading,
    error,
  };
};
