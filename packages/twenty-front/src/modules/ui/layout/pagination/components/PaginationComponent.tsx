import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { Button, IconButton } from 'twenty-ui/input';

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type PaginationComponentProps = {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPageSelector?: boolean;
  showTotalItems?: boolean;
  className?: string;
};

const StyledPaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledPaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledPaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPageNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPageButton = styled(Button)<{ isActive?: boolean }>`
  min-width: 32px;
  height: 32px;
  padding: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ isActive, theme }) => 
    isActive ? theme.font.weight.semiBold : theme.font.weight.medium};
  background-color: ${({ isActive, theme }) => 
    isActive ? theme.color.blue : 'transparent'};
  color: ${({ isActive, theme }) => 
    isActive ? theme.font.color.inverted : theme.font.color.secondary};
  border: 1px solid ${({ isActive, theme }) => 
    isActive ? theme.color.blue : theme.border.color.medium};

  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  &:hover {
    background-color: ${({ isActive, theme }) => 
      isActive ? theme.color.blue : theme.background.transparent.light};
    border-color: ${({ isActive, theme }) => 
      isActive ? theme.color.blue : theme.border.color.strong};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledItemsPerPageSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledSelect = styled.select`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.color.blue};
    outline-offset: 2px;
  }
`;

export const PaginationComponent = ({
  pagination,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50],
  showItemsPerPageSelector = true,
  showTotalItems = true,
  className,
}: PaginationComponentProps) => {
  const { t } = useLingui();

  const pageNumbers = useMemo(() => {
    const { currentPage, totalPages } = pagination;
    const delta = 2; // Número de páginas a mostrar antes e depois da atual
    const range = [];
    const rangeWithDots = [];

    // Calcular o range de páginas
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Adicionar primeira página
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Adicionar range calculado
    rangeWithDots.push(...range);

    // Adicionar última página
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [pagination.currentPage, pagination.totalPages]);

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    onItemsPerPageChange?.(newLimit);
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <StyledPaginationContainer className={className}>
      {showTotalItems && (
        <StyledPaginationInfo>
          {t`Showing`} {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} {t`to`}{' '}
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} {t`of`}{' '}
          {pagination.totalItems} {t`results`}
        </StyledPaginationInfo>
      )}

      <StyledPaginationControls>
        <IconButton
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          Icon={IconChevronLeft}
          variant="tertiary"
          size="small"
        />

        <StyledPageNumbers>
          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return (
                <span key={`dots-${index}`} style={{ padding: '0 8px' }}>
                  ...
                </span>
              );
            }

            const page = pageNumber as number;
            return (
              <StyledPageButton
                key={page}
                onClick={() => onPageChange(page)}
                isActive={page === pagination.currentPage}
                variant="tertiary"
                size="small"
                title={page.toString()}
              />
            );
          })}
        </StyledPageNumbers>

        <IconButton
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          Icon={IconChevronRight}
          variant="tertiary"
          size="small"
          ariaLabel={t`Next page`}
        />
      </StyledPaginationControls>

      {showItemsPerPageSelector && onItemsPerPageChange && (
        <StyledItemsPerPageSelector>
          <span>{t`Items per page:`}</span>
          <StyledSelect
            value={pagination.itemsPerPage}
            onChange={handleItemsPerPageChange}
            title={t`Select items per page`}
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </StyledSelect>
        </StyledItemsPerPageSelector>
      )}
    </StyledPaginationContainer>
  );
};
