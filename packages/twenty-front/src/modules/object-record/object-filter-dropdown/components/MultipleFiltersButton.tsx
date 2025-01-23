import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useTranslation } from 'react-i18next';

export const MultipleFiltersButton = () => {
  const { resetFilterDropdown } = useResetFilterDropdown();

  const { t } = useTranslation();
  const { toggleDropdown, isDropdownOpen } = useDropdown(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const handleClick = () => {
    toggleDropdown();
    resetFilterDropdown();
  };

  return (
    <StyledHeaderDropdownButton
      onClick={handleClick}
      isUnfolded={isDropdownOpen}
    >
      {t('filter')}
    </StyledHeaderDropdownButton>
  );
};
