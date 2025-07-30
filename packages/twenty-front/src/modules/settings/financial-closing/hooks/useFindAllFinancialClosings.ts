import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { GET_ALL_FINANCIAL_CLOSINGS } from '@/settings/financial-closing/graphql/query/financialClosingByWorkspace';
import { FinancialClosing } from '@/settings/financial-closing/types/FinancialClosing';

type UseFindAllFinancialClosingsReturn = {
  financialClosings: FinancialClosing[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllFinancialClosings = (): UseFindAllFinancialClosingsReturn => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: financialClosingsData,
    loading,
    refetch,
  } = useQuery(GET_ALL_FINANCIAL_CLOSINGS, {
    variables: { workspaceId: currentWorkspace?.id },
    skip: !currentWorkspace?.id,
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    financialClosings: financialClosingsData?.financialClosingsByWorkspace ?? [],
    loading,
    refetch,
  };
};
