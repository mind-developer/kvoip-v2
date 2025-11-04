import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { CREATE_TELEPHONY } from '../graphql/mutations/createTelephony';
import { type CreateTelephonyInput } from '../types/SettingsServiceCenterTelephony';

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
    } catch (err: any) {
      // TODO: Add proper error message
      // enqueueErrorSnackBar({
      //   message: err.message || t`Telephony creation error`,
      // });
      throw err;
    }
  };

  return {
    createTelephony,
    data,
    loading,
    error,
  };
};
