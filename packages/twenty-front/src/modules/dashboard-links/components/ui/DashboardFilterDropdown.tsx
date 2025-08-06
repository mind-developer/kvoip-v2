import { Select } from '@/ui/input/components/Select';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import { useState } from 'react';

type DashboardFilterDropdownProps = {
  onChange: () => void;
  scopeKey: string;
};

type RecordType = 'week' | 'month' | 'year';

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
  const [recordType, setRecordType] = useState<RecordType>('week');

  const dropdownId = `${scopeKey}-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleChange = () => {
    onChange();
    closeDropdown();
  };

  const recordTypeOptions: { label: string; value: RecordType }[] = [
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This year', value: 'year' },
  ];

  return (
    <StyledSelect
      dropdownId={dropdownId}
      options={recordTypeOptions}
      value={recordType}
      onChange={(val) => setRecordType(val)}
    />
  );
};
