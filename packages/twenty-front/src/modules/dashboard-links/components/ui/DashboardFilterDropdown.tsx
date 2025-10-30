import { type FilterType } from '@/dashboard-links/utils/filterLinkLogsData';
import { Select } from '@/ui/input/components/Select';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

type DashboardFilterDropdownProps = {
  onChange: (val: any) => void;
  scopeKey: string;
};

const StyledSelect = styled(Select)`
  & div {
    background: ${({ theme }) => theme.background.secondary};
    color: ${({ theme }) => theme.font.color.secondary};
    border: ${({ theme }) => theme.background.secondary};
  }
`;

export const DashboardFilterDropdown = ({
  onChange,
  scopeKey,
}: DashboardFilterDropdownProps) => {
  const { t } = useLingui();
  const [recordType, setRecordType] = useState<FilterType>('week');

  const dropdownId = `${scopeKey}-active-action-dropdown`;
  const { toggleDropdown } = useToggleDropdown();

  const handleChange = (val: any) => {
    setRecordType(val);
    onChange(val);
    toggleDropdown();
  };

  const recordTypeOptions: { label: string; value: FilterType }[] = [
    { label: t`This week`, value: 'week' },
    { label: t`This month`, value: 'month' },
    { label: t`This year`, value: 'year' },
  ];

  return (
    <StyledSelect
      dropdownId={dropdownId}
      options={recordTypeOptions}
      value={recordType}
      onChange={handleChange}
    />
  );
};
