import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { GET_ALL_TELEPHONYS_PAGINATED } from '@/settings/service-center/telephony/graphql/queries/getAllTelephonysPaginated';

type PaginationParams = {
  page: number;
  limit: number;
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type UseFindAllTelephonysWithPaginateReturn = {
  telephonys: Telephony[];
  loading: boolean;
  error: Error | undefined;
  hasError: boolean;
  refetch: () => void;
  pagination: PaginationInfo;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setItemsPerPage: (limit: number) => void;
};

const DEFAULT_ITEMS_PER_PAGE = 10;

export const useFindAllTelephonysWithPaginate = (
  initialPage: number = 1,
  initialLimit: number = DEFAULT_ITEMS_PER_PAGE,
): UseFindAllTelephonysWithPaginateReturn => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: initialPage,
    limit: initialLimit,
  });

  const {
    data: telephonysData,
    loading,
    error,
    refetch,
  } = useQuery(GET_ALL_TELEPHONYS_PAGINATED, {
    variables: { 
      workspaceId: currentWorkspace?.id,
      page: paginationParams.page,
      limit: paginationParams.limit,
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    },
  });

  const telephonys = telephonysData?.findAllTelephonyIntegrationPaginated?.data || [];
  const paginationData = telephonysData?.findAllTelephonyIntegrationPaginated?.pagination;

  const pagination: PaginationInfo = {
    currentPage: paginationData?.currentPage || 1,
    totalPages: paginationData?.totalPages || 1,
    totalItems: paginationData?.totalItems || 0,
    itemsPerPage: paginationData?.itemsPerPage || DEFAULT_ITEMS_PER_PAGE,
    hasNextPage: paginationData?.hasNextPage || false,
    hasPreviousPage: paginationData?.hasPreviousPage || false,
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPaginationParams(prev => ({ ...prev, page }));
    }
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (pagination.hasPreviousPage) {
      goToPage(pagination.currentPage - 1);
    }
  };

  const setItemsPerPage = (limit: number) => {
    setPaginationParams(prev => ({ ...prev, limit, page: 1 }));
  };

  return {
    telephonys,
    loading,
    error,
    hasError: !!error,
    refetch,
    pagination,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage,
  };
};
