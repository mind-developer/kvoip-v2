// // packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
// import { useQuery } from '@apollo/client';

// import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
// import { GET_ALL_SECTORS } from '@/settings/service-center/sectors/graphql/query/sectorsByWorkspace';
// import { Sector } from '@/settings/service-center/sectors/types/Sector';
// import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
// import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
// import { useRecoilValue } from 'recoil';

// type UseFindAllSectorsReturn = {
//   sectors: Sector[];
//   loading: boolean;
//   refetch: () => void;
// };

// export const useFindAllSectors = (): UseFindAllSectorsReturn => {
//   const { enqueueSnackBar } = useSnackBar();
//   const currentWorkspace = useRecoilValue(currentWorkspaceState);

//   const {
//     data: sectorsData,
//     loading,
//     refetch,
//   } = useQuery(GET_ALL_SECTORS, {
//     variables: { workspaceId: currentWorkspace?.id },
//     onError: (error) => {
//       enqueueSnackBar(error.message, {
//         variant: SnackBarVariant.Error,
//       });
//     },
//   });

//   return {
//     sectors: sectorsData?.sectorsByWorkspace,
//     loading,
//     refetch,
//   };
// };


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
